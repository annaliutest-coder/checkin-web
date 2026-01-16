
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Mail, Clock, Send, ShieldCheck, 
  Info, UserCheck, AlertCircle, Sparkles, 
  DatabaseZap, ExternalLink, Copy, Check 
} from 'lucide-react';
import { AppStatus, CheckInData } from './types';
import { ADMIN_EMAIL, PUBLIC_CONTACT_EMAIL, GOOGLE_SCRIPT_URL, GOOGLE_APPS_SCRIPT_CODE } from './constants';
import { getMotivationalMessage } from './services/geminiService';

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<CheckInData[]>([]);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [copied, setCopied] = useState(false);

  const isBackendConfigured = GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID');

  useEffect(() => {
    const saved = localStorage.getItem('ntnu_checkin_log');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !email.includes('@')) {
      setErrorMsg("請輸入有效的電子郵件");
      return;
    }

    setStatus(AppStatus.SUBMITTING);
    const timestamp = new Date().toLocaleString('zh-TW', { hour12: false });
    const newEntry: CheckInData = { email, timestamp, id: Date.now().toString() };

    try {
      const msgPromise = getMotivationalMessage(email);

      if (isBackendConfigured) {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry),
        });
      }

      const msg = await msgPromise;
      setAiMessage(msg);

      const updatedHistory = [newEntry, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem('ntnu_checkin_log', JSON.stringify(updatedHistory));

      setStatus(AppStatus.SUCCESS);
      setEmail('');
      setTimeout(() => setStatus(AppStatus.IDLE), 10000);
    } catch (err) {
      console.error(err);
      setErrorMsg("發生錯誤，請稍後再試。");
      setStatus(AppStatus.ERROR);
      setTimeout(() => setStatus(AppStatus.IDLE), 3000);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 bg-[#020617] text-slate-100 font-sans overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]"></div>
      </div>

      <main className="w-full max-w-lg z-10 space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-slate-900/50 border border-red-900/30 shadow-2xl backdrop-blur-md mb-2">
            <UserCheck className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-white">
            NTNU <span className="text-red-600">Smart Check-in</span>
          </h1>
          <div className="space-y-1">
            <p className="text-slate-200 font-bold text-lg tracking-wide">師大華語文教學系 國際華語與文化組</p>
            <p className="text-slate-500 font-medium uppercase tracking-[0.15em] text-[10px]">Department of Chinese as a Second Language</p>
          </div>
        </div>

        {!isBackendConfigured && (
          <button 
            onClick={() => setShowSetup(true)}
            className="w-full flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-sm hover:bg-amber-500/20 transition-all group active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <DatabaseZap className="w-5 h-5 animate-pulse" />
              <div className="text-left">
                <p className="font-bold">尚未連動發信功能</p>
                <p className="text-[10px] opacity-70">點擊查看如何以 {ADMIN_EMAIL} 身分發信</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        <div className="glass rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-white/10">
          <div className="scan-line"></div>
          
          {status === AppStatus.SUCCESS ? (
            <div className="py-6 text-center space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-green-500/20 rounded-full success-pulse"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-green-500/20 rounded-full text-green-400 border border-green-500/30">
                  <CheckCircle className="w-12 h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">已經把資訊寄給你了</h2>
                <p className="text-slate-400 text-sm italic px-4">"{aiMessage}"</p>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-semibold">
                  <Mail className="w-3 h-3" />
                  歡迎信已寄送，如有疑問請洽系辦
                </div>
                <button 
                  onClick={() => setStatus(AppStatus.IDLE)}
                  className="text-slate-500 hover:text-white text-xs transition-colors underline underline-offset-4 p-2"
                >
                  回首頁
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCheckIn} className="space-y-6 py-2">
              <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">輸入您的電子郵件</label>
                  {errorMsg && <span className="text-[10px] text-red-500 font-bold">{errorMsg}</span>}
                </div>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="email"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="例如: student@gmail.com"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-red-600/30 focus:border-red-600 transition-all text-lg placeholder:text-slate-700"
                    disabled={status === AppStatus.SUBMITTING}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === AppStatus.SUBMITTING}
                className="w-full bg-red-700 hover:bg-red-600 disabled:bg-slate-800 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] text-white shadow-xl shadow-red-950/30 group"
              >
                {status === AppStatus.SUBMITTING ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>處理中...</span>
                  </div>
                ) : (
                  <>
                    <span>立即打卡領取資訊</span>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {history.length > 0 && status !== AppStatus.SUCCESS && (
          <div className="glass rounded-[2rem] p-6 space-y-4 shadow-xl border border-white/5">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
              <Clock className="w-4 h-4" /> 最近紀錄
            </h3>
            <div className="space-y-2">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/30 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col min-w-0">
                    <span className="text-slate-200 text-sm font-semibold truncate">{item.email}</span>
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500/40 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center pt-2 pb-6">
          <p className="text-slate-700 text-[9px] tracking-[0.3em] uppercase">
            &copy; 2026 NTNU TCSL • CONTACT: {PUBLIC_CONTACT_EMAIL}
          </p>
        </div>
      </main>

      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[85vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                <DatabaseZap className="text-amber-500" /> 後端發信設定教學
              </h2>
              <button onClick={() => setShowSetup(false)} className="p-2 text-slate-500 hover:text-white">✕</button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 text-sm overscroll-contain">
              <div className="p-4 bg-blue-900/20 border border-blue-900/30 rounded-xl">
                <p className="text-blue-200 font-bold mb-1">💡 專業建議：</p>
                <p className="text-blue-300/80 text-xs leading-relaxed">請使用 <strong>{ADMIN_EMAIL}</strong> 帳號登入 Google 並執行以下步驟，這樣學生收到的信件寄件者才會顯示為該信箱。</p>
              </div>

              <div className="space-y-3">
                <h3 className="text-amber-500 font-bold">1. 貼上程式碼</h3>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>開啟一個新的 Google 試算表。</li>
                  <li>點擊「延伸模組」 &gt; 「Apps Script」。</li>
                  <li>刪除所有內容並貼上下方的程式碼：</li>
                </ol>
                <div className="relative group mt-2">
                  <pre className="bg-black/50 p-4 rounded-xl text-xs overflow-x-auto text-blue-300 border border-slate-700 h-48 scrollbar-thin">
                    {GOOGLE_APPS_SCRIPT_CODE}
                  </pre>
                  <button 
                    onClick={copyCode}
                    className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    <span className="text-[10px]">{copied ? '已複製' : '複製'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-amber-500 font-bold">2. 部署網頁應用程式</h3>
                <ul className="list-disc list-inside space-y-2 text-slate-300 leading-relaxed">
                  <li>點擊「部署」 &gt; 「新部署」。</li>
                  <li>類型選「網頁應用程式」。</li>
                  <li>執行身分：<span className="text-white font-bold">我 ({ADMIN_EMAIL})</span></li>
                  <li>誰可以存取：<span className="text-red-500 underline font-bold">「任何人」(Anyone)</span></li>
                  <li>按部署，並在彈出的權限視窗選「允許」。</li>
                </ul>
              </div>

              <div className="p-4 bg-red-900/20 border border-red-900/30 rounded-xl">
                <p className="text-red-200 font-bold mb-1">3. 最後一步</p>
                <p className="text-red-300/80 text-xs">複製部署後獲得的 URL，將其貼回專案的 <code className="bg-black/30 px-1">constants.ts</code> 檔案中的 <code className="bg-black/30 px-1">GOOGLE_SCRIPT_URL</code>。</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-950/50 border-t border-slate-800">
              <button 
                onClick={() => setShowSetup(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-xl font-bold transition-colors text-white active:scale-[0.98]"
              >
                關閉教學視窗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
