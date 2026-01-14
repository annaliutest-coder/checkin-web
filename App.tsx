
import React, { useState, useEffect } from 'react';
import { CheckCircle, Mail, Clock, Send, ShieldCheck, Info, QrCode, AlertTriangle } from 'lucide-react';
import { AppStatus, CheckInData } from './types';
import { TARGET_EMAIL, GOOGLE_SCRIPT_URL, GOOGLE_APPS_SCRIPT_CODE } from './constants';
import { getMotivationalMessage } from './services/geminiService';

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<CheckInData[]>([]);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ntnu_checkin_log');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus(AppStatus.SUBMITTING);
    const timestamp = new Date().toLocaleString('zh-TW', { hour12: false });
    const newEntry: CheckInData = { email, timestamp, id: Date.now().toString() };

    try {
      // 1. AI 鼓勵語
      const msg = await getMotivationalMessage(email);
      setAiMessage(msg);

      // 2. 發送至後端
      if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
        try {
          await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(newEntry),
          });
        } catch (err) {
          console.warn("後端串接失敗，但仍紀錄於本地。", err);
        }
      }

      // 3. 更新狀態
      const updatedHistory = [newEntry, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem('ntnu_checkin_log', JSON.stringify(updatedHistory));

      setStatus(AppStatus.SUCCESS);
      setEmail('');
      
      setTimeout(() => setStatus(AppStatus.IDLE), 10000);
    } catch (err) {
      console.error(err);
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* 背景裝飾 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-maroon-900/10 rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(128, 0, 0, 0.15)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      <main className="w-full max-w-xl z-10 space-y-8">
        {/* Logo 區 */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-red-900/40 to-slate-900/40 border border-red-800/30 shadow-xl mb-2">
            <QrCode className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            <span className="text-white">NTNU</span>
            <span className="text-red-500 ml-2">Smart Check-in</span>
          </h1>
          <div className="h-1 w-24 bg-red-600 mx-auto rounded-full"></div>
        </div>

        {/* 主卡片 */}
        <div className="glass rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group border-t border-white/10">
          <div className="scan-line"></div>
          
          {status === AppStatus.SUCCESS ? (
            <div className="py-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-green-500/20 rounded-full success-pulse"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-green-500/30 rounded-full text-green-400 border border-green-500/50">
                  <CheckCircle className="w-12 h-12" />
                </div>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">打卡成功</h2>
                <p className="text-slate-400 text-sm">通知已同步至管理端 ({TARGET_EMAIL})</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 italic text-blue-300 text-sm leading-relaxed">
                "{aiMessage}"
              </div>
              <button 
                onClick={() => setStatus(AppStatus.IDLE)}
                className="text-slate-400 hover:text-white text-sm transition-colors underline underline-offset-4"
              >
                返回打卡頁面
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckIn} className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                  <label className="text-sm font-medium text-slate-400">學生電子郵件</label>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest">Email Verification</span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-red-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@ntnu.edu.tw"
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-2xl py-5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === AppStatus.SUBMITTING}
                className="w-full bg-red-700 hover:bg-red-600 disabled:bg-slate-800 disabled:text-slate-500 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg shadow-red-950/20 border border-red-500/30"
              >
                {status === AppStatus.SUBMITTING ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    認證中...
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-6 h-6" />
                    確認打卡
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 py-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-700"></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Powered by Gemini AI</span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-700"></div>
              </div>
            </form>
          )}
        </div>

        {/* 歷史紀錄 */}
        {history.length > 0 && (
          <div className="glass rounded-[1.5rem] p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2 px-1">
              <Clock className="w-4 h-4" />
              最近五筆紀錄
            </h3>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-slate-200 text-sm font-medium">{item.email}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{item.timestamp}</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 設定區塊 */}
        <div className="pt-4">
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="w-full text-slate-600 hover:text-slate-400 text-xs py-2 transition-colors flex items-center justify-center gap-1"
          >
            <Info className="w-3 h-3" />
            {showConfig ? "收起技術文件" : "部署至 Zeabur 的注意事項"}
          </button>
          
          {showConfig && (
            <div className="mt-4 p-5 glass rounded-2xl space-y-4 text-xs text-slate-400 leading-relaxed border-red-900/20">
              <div className="flex items-start gap-2 text-amber-500">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p className="font-semibold italic underline">請在 Zeabur 的 Environment Variables 設定 API_KEY，否則 AI 功能將失效。</p>
              </div>
              <p>後端串接 (Google Sheets)：</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>將 <code className="text-red-400">constants.ts</code> 中的程式碼部署為 Google Apps Script。</li>
                <li>設定權限為「任何人」。</li>
                <li>將產生的網址貼回 <code className="text-red-400">GOOGLE_SCRIPT_URL</code>。</li>
              </ol>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
