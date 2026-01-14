
import React, { useState, useEffect } from 'react';
import { CheckCircle, Mail, Clock, Send, ShieldCheck, Info, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { AppStatus, CheckInData } from './types';
import { TARGET_EMAIL, GOOGLE_SCRIPT_URL } from './constants';
import { getMotivationalMessage } from './services/geminiService';

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<CheckInData[]>([]);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ntnu_checkin_log');
    if (saved) {
      try { 
        setHistory(JSON.parse(saved)); 
      } catch (e) { 
        console.error("無法載入歷史紀錄", e); 
      }
    }
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    
    if (!email || !email.includes('@')) {
      setErrorMsg("請輸入正確的電子郵件");
      return;
    }

    setStatus(AppStatus.SUBMITTING);
    const timestamp = new Date().toLocaleString('zh-TW', { hour12: false });
    const newEntry: CheckInData = { email, timestamp, id: Date.now().toString() };

    try {
      // 1. AI 歡迎語
      const msg = await getMotivationalMessage(email);
      setAiMessage(msg);

      // 2. 後端同步 (發信與存檔)
      if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
        try {
          await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(newEntry),
          });
        } catch (err) {
          console.warn("後端同步暫時不可用，但紀錄已保存在本地");
        }
      }

      // 3. 更新紀錄
      const updatedHistory = [newEntry, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem('ntnu_checkin_log', JSON.stringify(updatedHistory));

      setStatus(AppStatus.SUCCESS);
      setEmail('');
      
      // 8秒後自動回到輸入介面
      setTimeout(() => setStatus(AppStatus.IDLE), 10000);
    } catch (err) {
      console.error(err);
      setErrorMsg("系統錯誤，請稍後再試。");
      setStatus(AppStatus.ERROR);
      setTimeout(() => setStatus(AppStatus.IDLE), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#020617] text-slate-100">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      <main className="w-full max-w-lg z-10 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-slate-900/50 border border-red-900/30 shadow-2xl backdrop-blur-md">
            <UserCheck className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white">
              NTNU <span className="text-red-600">Smart Check-in</span>
            </h1>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Department of Chinese as a Second Language</p>
          </div>
        </div>

        <div className="glass rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-white/5">
          <div className="scan-line"></div>
          
          {status === AppStatus.SUCCESS ? (
            <div className="py-4 text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-green-500/20 rounded-full success-pulse"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-green-500/20 rounded-full text-green-400 border border-green-500/30">
                  <CheckCircle className="w-12 h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">打卡完成！</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  歡迎信已寄送至您的信箱
                </div>
              </div>
              <div className="p-6 bg-slate-950/50 rounded-2xl border border-white/5 italic text-red-100 text-sm leading-relaxed shadow-inner">
                "{aiMessage}"
              </div>
              <button 
                onClick={() => setStatus(AppStatus.IDLE)}
                className="text-slate-500 hover:text-white text-sm transition-colors pt-2"
              >
                ← 返回
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckIn} className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between px-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">請輸入電子郵件獲取申請資訊</label>
                  {errorMsg && <span className="text-xs text-red-500 font-medium">{errorMsg}</span>}
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@ntnu.edu.tw"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all text-lg"
                    disabled={status === AppStatus.SUBMITTING}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === AppStatus.SUBMITTING}
                className="w-full bg-red-700 hover:bg-red-600 disabled:bg-slate-800 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] text-white shadow-xl shadow-red-950/30"
              >
                {status === AppStatus.SUBMITTING ? "發送中..." : "立即打卡領取資訊"}
              </button>
            </form>
          )}
        </div>

        {history.length > 0 && status !== AppStatus.SUCCESS && (
          <div className="glass rounded-[2rem] p-6 space-y-4 shadow-xl border border-white/5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" /> 最近紀錄
            </h3>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-slate-200 text-sm font-semibold">{item.email}</span>
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500/60" />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-center pt-4">
          <p className="text-slate-700 text-[10px] tracking-widest uppercase">
            &copy; {new Date().getFullYear()} NTNU TCSL • International Student Group
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
