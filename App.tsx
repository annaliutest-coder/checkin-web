
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Mail, Clock, Send, ShieldCheck, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { AppStatus, CheckInData } from './types';
import { TARGET_EMAIL, GOOGLE_SCRIPT_URL, GOOGLE_APPS_SCRIPT_CODE } from './constants';
import { getMotivationalMessage } from './services/geminiService';

const App: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [history, setHistory] = useState<CheckInData[]>([]);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('checkin_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setStatus(AppStatus.SUBMITTING);
    const timestamp = new Date().toLocaleString();
    const newEntry: CheckInData = {
      email,
      timestamp,
      id: Date.now().toString()
    };

    try {
      // 1. Get AI Encouragement
      const msg = await getMotivationalMessage(email);
      setAiMessage(msg);

      // 2. Attempt to save to Google Sheet (if URL is configured)
      // In this demo, we handle the lack of URL gracefully
      if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'https://script.google.com/macros/s/AKfycbyEiX6rIeiP-hY3AjWK8RW0pM6LwiCIZytzbZDHZPO7Bek0_cw0u7Kb8bUwA93rMmmvoQ/exec') {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // Apps script usually requires no-cors for simple posts
          body: JSON.stringify(newEntry),
        });
      }

      // 3. Update local history
      const updatedHistory = [newEntry, ...history].slice(0, 5);
      setHistory(updatedHistory);
      localStorage.setItem('checkin_history', JSON.stringify(updatedHistory));

      setStatus(AppStatus.SUCCESS);
      setEmail('');
      
      // Reset status after 5 seconds to allow more check-ins
      setTimeout(() => {
        setStatus(AppStatus.IDLE);
      }, 8000);

    } catch (err) {
      console.error(err);
      setStatus(AppStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      <main className="w-full max-w-2xl z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-12">
          <div className="inline-block p-3 bg-blue-500/10 rounded-2xl mb-4 floating">
            <ShieldCheck className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            NTNU Smart Check-in
          </h1>
          <p className="text-slate-400 text-lg">快速打卡系統 • 智慧入座</p>
        </div>

        {/* Check-in Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {status === AppStatus.SUCCESS ? (
            <div className="text-center py-12 space-y-6 transition-all duration-500 scale-100 opacity-100">
              <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 neon-glow">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">打卡完成！</h2>
                <p className="text-slate-400">已發送通知至 {TARGET_EMAIL}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 max-w-md mx-auto italic text-blue-200">
                "{aiMessage}"
              </div>
              <button 
                onClick={() => setStatus(AppStatus.IDLE)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-colors"
              >
                再次打卡
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckIn} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 ml-1">
                  請輸入學生 Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@ntnu.edu.tw"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-lg placeholder:text-slate-600"
                    disabled={status === AppStatus.SUBMITTING}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === AppStatus.SUBMITTING}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg shadow-blue-900/20"
              >
                {status === AppStatus.SUBMITTING ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    處理中...
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    立即打卡
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>系統將自動同步至 Google Sheets</span>
              </div>
            </form>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="glass rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              最近打卡紀錄
            </h3>
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-medium">{item.email}</span>
                    <span className="text-xs text-slate-500">{item.timestamp}</span>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backend Setup Info */}
        <div className="mt-12">
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition-colors py-4 border-t border-slate-800"
            >
              <Info className="w-4 h-4" />
              {showConfig ? "隱藏後端設定資訊" : "顯示後端設定教學 (Google Sheets)"}
            </button>
            
            {showConfig && (
              <div className="glass rounded-2xl p-6 mt-4 animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
                <p className="text-sm text-slate-400">
                  要將打卡資料存入 Google Sheets，請按照以下步驟：
                </p>
                <ol className="text-sm text-slate-300 space-y-3 list-decimal list-inside">
                  <li>建立一個新的 Google 試算表。</li>
                  <li>點擊 <strong>延伸模組</strong> {">"} <strong>Apps Script</strong>。</li>
                  <li>貼上以下程式碼並儲存：</li>
                </ol>
                <pre className="bg-slate-950 p-4 rounded-xl text-xs overflow-x-auto text-blue-400 border border-slate-800">
                  {GOOGLE_APPS_SCRIPT_CODE}
                </pre>
                <ol className="text-sm text-slate-300 space-y-3 list-decimal list-inside" start={4}>
                  <li>點擊 <strong>部署</strong> {">"} <strong>新增部署</strong>。</li>
                  <li>類型選擇 <strong>網頁應用程式</strong>，權限設為 <strong>任何人</strong>。</li>
                  <li>部署後複製 <strong>網頁應用程式 URL</strong> 並更新程式碼中的 <code>GOOGLE_SCRIPT_URL</code>。</li>
                </ol>
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs mt-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>注意：目前此網頁僅用於前端展示，需完成上述部署方可連結資料庫。</span>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <footer className="text-center text-slate-600 text-sm pb-12">
          &copy; {new Date().getFullYear()} National Taiwan Normal University. Designed for Excellence.
        </footer>
      </main>
    </div>
  );
};

export default App;
