
import React, { useState, useEffect } from 'react';
import { analyzeStudyMaterial } from './geminiService';
import { AnalysisResult } from './types';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import AnalysisDashboard from './components/AnalysisDashboard';

interface SavedSession {
  id: string;
  title: string;
  data: AnalysisResult;
  timestamp: number;
}

const translations = {
  ar: {
    tagline: "الذكاء الاصطناعي في خدمة طموحك الدراسي",
    selectLang: "اختر لغة الدراسة والواجهة",
    howItWorksTitle: "كيف يعمل UNIQUE؟",
    howItWorksDesc: "ارفع صورة كتابك أو ملازمك الدراسية، وسيقوم المساعد الذكي بتحليلها فوراً ليقدم لك ملخصاً ذكياً، واختبارات مخصصة (MCQ، فراغات، صح وخطأ)، مع ترشيح أفضل المصادر لضمان تفوقك.",
    creatorPrefix: "تم إنشاء هذه المنصة من قبل",
    creatorName: "عيسى سعيد عبد الكريم",
    creatorDept: "هندسة تقنيات الأمن السيبراني",
    loadingTitle: "جارٍ معالجة مادتك العلمية",
    loadingWait: "يرجى الانتظار قليلاً، UNIQUE يحلل محتواك الآن...",
    errorFile: "حدث خطأ أثناء تحليل الملف. يرجى التأكد من جودة الصورة أو حجم الملف والمحاولة مرة أخرى.",
    errorRead: "فشل في قراءة الملف.",
    backBtn: "العودة",
    restoreBtn: "استعادة",
    welcomeBack: "مرحباً بعودتك! المواد الدراسية السابقة:",
    noSavedSessions: "لا توجد مواد محفوظة حالياً.",
    copyright: "© 2024 UNIQUE - رفيقك الدراسي الذكي",
    studentLogin: "دخول الطالب",
    deleteSession: "حذف"
  },
  en: {
    tagline: "AI at the service of your academic ambition",
    selectLang: "Choose Study & Interface Language",
    howItWorksTitle: "How UNIQUE Works?",
    howItWorksDesc: "Upload an image of your book or study sheets, and the smart assistant will immediately analyze them to provide you with a smart summary, customized tests (MCQ, blanks, true/false), and the best source recommendations to ensure your excellence.",
    creatorPrefix: "This platform was created by",
    creatorName: "Issa Saeed Abdul Kareem",
    creatorDept: "Cybersecurity Engineering",
    loadingTitle: "Processing your study material",
    loadingWait: "Please wait a moment, UNIQUE is analyzing your content now...",
    errorFile: "An error occurred while analyzing the file. Please check the image quality or file size and try again.",
    errorRead: "Failed to read file.",
    backBtn: "Back",
    restoreBtn: "Restore",
    welcomeBack: "Welcome back! Previous study materials:",
    noSavedSessions: "No saved materials yet.",
    copyright: "© 2024 UNIQUE - Your Smart Study Companion",
    studentLogin: "Student Login",
    deleteSession: "Delete"
  }
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [loadingStep, setLoadingStep] = useState(0);

  const t = translations[language];

  const loadingMessages = language === 'ar' ? [
    "جاري استلام الملف...",
    "يتم الآن تحليل النصوص...",
    "نقوم بتوليد ملخص شامل...",
    "تصميم اختبارات MCQ...",
    "صياغة أسئلة الفراغات...",
    "البحث عن أفضل الشروحات...",
    "تجهيز قاموس المصطلحات...",
    "UNIQUE يضع اللمسات النهائية..."
  ] : [
    "Receiving file...",
    "Analyzing text...",
    "Generating summary...",
    "Designing MCQs...",
    "Formulating blanks...",
    "Finding explanations...",
    "Preparing terminology...",
    "UNIQUE is finalizing..."
  ];

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    const saved = localStorage.getItem('unique_saved_sessions');
    if (saved) {
      try {
        setSavedSessions(JSON.parse(saved));
      } catch (e) {
        setSavedSessions([]);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('unique_saved_sessions', JSON.stringify(savedSessions));
  }, [savedSessions]);

  useEffect(() => {
    let interval: number;
    if (loading) {
      setLoadingStep(0);
      interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading, loadingMessages]);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const mimeType = file.type;
        try {
          const analysis = await analyzeStudyMaterial(base64Data, mimeType, language);
          setResult(analysis);
          
          const newSession: SavedSession = {
            id: Date.now().toString(),
            title: analysis.mainTitle || (language === 'ar' ? "مادة جديدة" : "New Material"),
            data: analysis,
            timestamp: Date.now()
          };
          
          setSavedSessions(prev => [newSession, ...prev]);
        } catch (err) {
          setError(t.errorFile);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(t.errorRead);
      setLoading(false);
    }
  };

  const restoreSession = (sessionData: AnalysisResult) => {
    setResult(sessionData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedSessions(prev => prev.filter(s => s.id !== id));
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} ${language === 'en' ? 'ltr' : 'rtl'}`} dir={language === 'en' ? 'ltr' : 'rtl'}>
      <Header onLogoClick={reset} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} language={language} loginText={t.studentLogin} />
      
      <main className="flex-grow container mx-auto px-4 py-4 md:py-8 relative overflow-x-hidden">
        <div className="glow-orb w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-indigo-500/20 dark:bg-indigo-500/10 top-[-50px] left-[-50px] blur-[60px] md:blur-[120px]"></div>

        {!result && !loading && (
          <div className="max-w-4xl mx-auto text-center mt-4 md:mt-8 z-10 relative">
            
            {savedSessions.length > 0 && (
              <div className="mb-8 md:mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-xl border border-white/20 dark:border-slate-800">
                  <h3 className="text-lg md:text-xl font-black mb-6 text-indigo-700 dark:text-indigo-400">{t.welcomeBack}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-h-[400px] overflow-y-auto scrollbar-hide p-1">
                    {savedSessions.map(session => (
                      <div
                        key={session.id}
                        onClick={() => restoreSession(session.data)}
                        className="group relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer text-right flex flex-col justify-between"
                      >
                        <button
                          onClick={(e) => deleteSession(e, session.id)}
                          className="absolute top-2 left-2 w-7 h-7 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white"
                          title={t.deleteSession}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <div className="mt-4">
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-sm mb-3">📄</div>
                          <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-tight mb-2">
                            {session.title}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                           <span className="text-[10px] text-slate-400 font-bold">
                             {new Date(session.timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                           </span>
                           <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-black">
                             {t.restoreBtn}
                           </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800 p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl mb-8">
              <div className="w-14 h-14 md:w-20 md:h-20 gradient-bg rounded-2xl flex items-center justify-center shadow-lg mb-4 md:mb-6 mx-auto cursor-pointer" onClick={reset}>
                <span className="text-white font-black text-2xl md:text-4xl">U</span>
              </div>
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  UNIQUE
                </span>
              </h1>
              <p className="text-xs md:text-xl lg:text-2xl text-slate-800 dark:text-slate-400 font-bold max-w-xl mx-auto">
                {t.tagline}
              </p>
            </div>

            <div className="mb-8 max-w-sm mx-auto">
              <div className="bg-white/60 dark:bg-slate-900/50 p-3 md:p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] md:text-xs font-black mb-3 uppercase tracking-widest opacity-60">{t.selectLang}</p>
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <button onClick={() => setLanguage('ar')} className={`px-4 py-2 rounded-xl font-black text-xs md:text-base transition-all ${language === 'ar' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-400'}`}>🇸🇦 العربي</button>
                  <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-xl font-black text-xs md:text-base transition-all ${language === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-400'}`}>🇺🇸 English</button>
                </div>
              </div>
            </div>

            <FileUpload onUpload={handleFileUpload} language={language} />

            <div className="max-w-3xl mx-auto my-12 px-2">
               <div className="bg-white dark:bg-slate-900/40 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-indigo-500/10 shadow-xl text-center">
                  <p className="text-slate-900 dark:text-slate-400 text-[10px] md:text-sm font-black uppercase tracking-widest mb-4">
                    {t.creatorPrefix}
                  </p>
                  <span className="text-2xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600 tracking-tighter block mb-4">
                    {t.creatorName}
                  </span>
                  <div className="inline-block px-4 py-1.5 bg-slate-200 dark:bg-white/5 rounded-xl text-[10px] md:text-sm font-black text-slate-900 dark:text-slate-300">
                    {t.creatorDept}
                  </div>
               </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-2xl px-6">
            <div className="max-w-md w-full text-center">
              <div className="w-20 h-20 md:w-36 md:h-36 gradient-bg rounded-[1.5rem] md:rounded-[3rem] flex items-center justify-center shadow-2xl animate-bounce mx-auto mb-8">
                 <span className="text-white font-black text-4xl md:text-7xl">U</span>
              </div>
              <h2 className="text-lg md:text-3xl font-black text-slate-900 dark:text-slate-100 min-h-[3rem] mb-4">
                {loadingMessages[loadingStep]}
              </h2>
              <div className="w-full h-2 bg-slate-300 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                <div className="h-full gradient-bg rounded-full transition-all duration-1000" style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-xs md:text-lg">{t.loadingWait}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="z-10 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AnalysisDashboard result={result} language={language} onReset={reset} />
          </div>
        )}
      </main>

      <footer className="mt-auto py-6 text-center border-t border-slate-200 dark:border-slate-800 opacity-60">
        <p className="text-[10px] md:text-sm font-black">{t.copyright}</p>
      </footer>
    </div>
  );
};

export default App;
