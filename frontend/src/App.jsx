import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal, CheckCircle2, AlertTriangle, Layers, PlusCircle, Play, LogIn, LogOut, Trash2, Eye } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { translations } from './translations';
import './App.css';

// 💡 تم وضع المتغير هنا بشكل صحيح بعد الـ imports وقبل دالة App لضمان نجاح الـ Build
const API_BASE_URL = "https://redshield-cvf2.onrender.com";

function App() {
  // ================= 1. الحالات (States) الأساسية =================
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [publicView, setPublicView] = useState('landing'); 
  const [userRole, setUserRole] = useState(parseInt(localStorage.getItem('role_id')) || 2);
  const [currentPage, setCurrentPage] = useState('scenarios'); 
  
  // إدارة اللغة والترجمة
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');
  const t = (key) => translations[lang][key] || key;

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');
  
  // بيانات التسجيل والدخول
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // بيانات الاختبار والسيناريوهات
  const [selectedModelId, setSelectedModelId] = useState(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [manualPrompt, setManualPrompt] = useState('');
  const [simulatedResponse, setSimulatedResponse] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isAutoScanning, setIsAutoScanning] = useState(false); 
  const [evaluationLabel, setEvaluationLabel] = useState('');
  const [currentTestRunId, setCurrentTestRunId] = useState(null);
  
  // حالة نافذة عرض الرد (Modal)
  const [viewResponseModal, setViewResponseModal] = useState({ isOpen: false, data: null });
  
  const [newScenario, setNewScenario] = useState({ name: '', category: 'Jailbreaking', severity: 'High', prompt: '' });
  const [scenarios, setScenarios] = useState([]);
  const [recentTests, setRecentTests] = useState([]);

  // ================= 2. دوال جلب البيانات =================
  const fetchScenarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE_URL + '/scenarios/', {
        method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) setScenarios(await response.json());
    } catch (error) { console.error("Error fetching scenarios:", error); }
  };

  const fetchTestRuns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(API_BASE_URL + '/test-runs/', {
        method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) setRecentTests(await response.json());
    } catch (error) { console.error("Error fetching test runs:", error); }
  };

  useEffect(() => {
    if (isLoggedIn) { fetchScenarios(); fetchTestRuns(); }
  }, [isLoggedIn]);

  const getModelName = (id) => {
    if (id === 1) return "Gemini 2.5 Pro";
    if (id === 2) return "Gemini 2.5 Flash";
    if (id === 3) return "Llama 3 (Groq)";
    return `Model #${id}`;
  };

  const getScenarioName = (id) => {
    if (!id) return t('customPrompt') || "Manual Custom Prompt"; 
    const scen = scenarios.find(s => s.id === id);
    return scen ? scen.title : `Scenario #${id} (Deleted)`;
  };

  // ================= 3. تأثير الخلفية العصبية =================
  useEffect(() => {
    if (isLoggedIn) return; 
    const canvas = document.getElementById('login-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;

    const particlesArray = [];
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() * 0.4) - 0.2; this.speedY = (Math.random() * 0.4) - 0.2;
      }
      update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
      }
      draw() {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.3)'; 
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }
    for (let i = 0; i < 85; i++) particlesArray.push(new Particle());

    function connect() {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${(1 - (distance / 120)) * 0.09})`; 
            ctx.lineWidth = 1; ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y); ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    let animationFrameId;
    function animate() {
      if (!document.getElementById('login-canvas')) return; 
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(p => { p.update(); p.draw(); });
      connect();
      animationFrameId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isLoggedIn, publicView]);

  // ================= 4. دوال المصادقة =================
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    const toastId = toast.loading('Authenticating...');
    try {
      const formData = new FormData(); formData.append('username', username); formData.append('password', password);
      const response = await fetch(API_BASE_URL + '/login', { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token); localStorage.setItem('role_id', data.role_id);
        setUserRole(data.role_id); setIsLoggedIn(true); setCurrentPage('scenarios');
        toast.success(lang === 'ar' ? 'تم تسجيل الدخول بنجاح!' : 'Login Successful!', { id: toastId });
      } else { toast.error(lang === 'ar' ? 'بيانات الدخول غير صحيحة.' : 'Invalid credentials.', { id: toastId }); }
    } catch (error) { toast.error(lang === 'ar' ? 'فشل الاتصال بالخادم.' : 'Server connection failed.', { id: toastId }); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) return;
    const toastId = toast.loading(lang === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...');
    try {
      const response = await fetch(API_BASE_URL + '/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: regName, email: regEmail, password: regPassword })
      });
      if (response.ok) {
        toast.success(lang === 'ar' ? 'تم الإنشاء بنجاح!' : 'Account Created!', { id: toastId });
        setRegName(''); setRegEmail(''); setRegPassword(''); setPublicView('login'); 
      } else {
        const errData = await response.json(); toast.error(errData.detail || 'Error', { id: toastId });
      }
    } catch (error) { toast.error(lang === 'ar' ? 'حدث خطأ.' : 'An error occurred.', { id: toastId }); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('role_id');
    setIsLoggedIn(false); setUsername(''); setPassword('');
    toast.success(lang === 'ar' ? 'تم تسجيل الخروج' : 'Logged out');
  };

  // ================= 5. دوال العمليات =================
  const handleAddScenario = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(lang === 'ar' ? 'جاري الحفظ...' : 'Saving...');
    try {
      const response = await fetch(API_BASE_URL + '/scenarios/', {
        method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newScenario.name, description: "System", prompt_text: newScenario.prompt, category: newScenario.category, severity: newScenario.severity })
      });
      if (response.ok) {
        await fetchScenarios();
        setNewScenario({ name: '', category: 'Jailbreaking', severity: 'High', prompt: '' });
        setShowAddForm(false); toast.success(lang === 'ar' ? 'تمت الإضافة!' : 'Added successfully!', { id: toastId });
      } else { toast.error('Error', { id: toastId }); }
    } catch (error) { toast.error('Error', { id: toastId }); }
  };

  const confirmDeleteScenario = async (id) => {
    const toastId = toast.loading(lang === 'ar' ? 'جاري الحذف...' : 'Deleting...');
    try {
      const response = await fetch(API_BASE_URL + '/scenarios/' + id, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (response.ok) { fetchScenarios(); toast.success(lang === 'ar' ? 'تم الحذف!' : 'Deleted!', { id: toastId }); } 
      else { toast.error('Error', { id: toastId }); }
    } catch (error) { toast.error('Error', { id: toastId }); }
  };

  const handleDeleteScenario = (id) => {
    toast((tId) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '300px', textAlign: lang === 'ar' ? 'right' : 'left', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
          <AlertTriangle size={22} /> <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('confirmTitle') || 'Confirm'}</span>
        </div>
        <span style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.5' }}>{t('confirmDeleteScen') || 'Delete scenario?'}</span>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '5px' }}>
          <button onClick={() => toast.dismiss(tId.id)} style={{ padding: '8px 16px', background: 'transparent', color: '#9ca3af', border: '1px solid #4b5563', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>{t('cancel') || 'Cancel'}</button>
          <button onClick={() => { toast.dismiss(tId.id); confirmDeleteScenario(id); }} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t('deleteBtn') || 'Delete'}</button>
        </div>
      </div>
    ), { id: 'delete-modal', duration: Infinity, position: 'top-center', style: { background: '#18181b', border: '1px solid #3f3f46', color: '#fff', marginTop: '35vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', padding: '20px' } });
  };

  const confirmDeleteTestRun = async (id) => {
    const toastId = toast.loading(lang === 'ar' ? 'جاري الحذف...' : 'Deleting...');
    try {
      const response = await fetch(API_BASE_URL + '/test-runs/' + id, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (response.ok) { fetchTestRuns(); toast.success(lang === 'ar' ? 'تم الحذف!' : 'Deleted!', { id: toastId }); } 
      else { toast.error('Error', { id: toastId }); }
    } catch (error) { toast.error('Error', { id: toastId }); }
  };

  const handleDeleteTestRun = (id) => {
    toast((tId) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '300px', textAlign: lang === 'ar' ? 'right' : 'left', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
          <AlertTriangle size={22} /> <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{t('confirmTitle') || 'Confirm'}</span>
        </div>
        <span style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.5' }}>{t('confirmDeleteLog') || 'Delete log?'}</span>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '5px' }}>
          <button onClick={() => toast.dismiss(tId.id)} style={{ padding: '8px 16px', background: 'transparent', color: '#9ca3af', border: '1px solid #4b5563', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>{t('cancel') || 'Cancel'}</button>
          <button onClick={() => { toast.dismiss(tId.id); confirmDeleteTestRun(id); }} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t('deleteBtn') || 'Delete'}</button>
        </div>
      </div>
    ), { id: 'delete-modal', duration: Infinity, position: 'top-center', style: { background: '#18181b', border: '1px solid #3f3f46', color: '#fff', marginTop: '35vh', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', padding: '20px' } });
  };

  const handleAutoScan = async () => {
    if (scenarios.length === 0) { toast.error(lang === 'ar' ? 'لا توجد سيناريوهات للفحص!' : 'No scenarios to scan!'); return; }
    const toastId = toast.loading(lang === 'ar' ? 'جاري شن الهجوم الشامل... يرجى الانتظار ⚡' : 'Running automated batch attack... ⚡');
    setIsAutoScanning(true);
    try {
      const response = await fetch(API_BASE_URL + '/auto-scan/?model_id=' + selectedModelId, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(lang === 'ar' ? `اكتمل الفحص! تم اختبار ${data.total_scanned} سيناريو بنجاح.` : `Audit Complete! ${data.total_scanned} scenarios tested.`, { id: toastId, duration: 5000 });
        await fetchTestRuns(); 
        setCurrentPage('result'); 
      } else { toast.error(lang === 'ar' ? 'فشل الفحص الآلي.' : 'Auto-audit failed.', { id: toastId }); }
    } catch (error) { toast.error(lang === 'ar' ? 'خطأ في الاتصال بالخادم.' : 'Server error.', { id: toastId }); } finally { setIsAutoScanning(false); }
  };

  const handleRunManualTest = async (e) => {
    e.preventDefault();
    if (!manualPrompt.trim()) return;
    setIsSimulating(true); setSimulatedResponse(''); setEvaluationLabel('');
    const toastId = toast.loading('Initializing attack sequence...');
    try {
      const testRunData = { scenario_id: parseInt(selectedScenarioId) || null, model_id: selectedModelId, run_mode: selectedScenarioId ? "library_scenario" : "manual_custom" };
      const response = await fetch(API_BASE_URL + '/test-runs/', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }, body: JSON.stringify(testRunData) });
      if (response.ok) {
        const data = await response.json(); setCurrentTestRunId(data.id);
        toast.success('Attack initialized...', { id: toastId });
        try {
          const aiResponse = await fetch(API_BASE_URL + '/simulate-attack/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: manualPrompt, model_name: selectedModelId === 1 ? "gemini-2.5-pro" : selectedModelId === 2 ? "gemini-2.5-flash" : "llama-3.1-8b-instant" }) });
          if (aiResponse.ok) { setSimulatedResponse((await aiResponse.json()).reply); } 
          else { setSimulatedResponse("Error"); toast.error('Model error'); }
        } catch (error) { setSimulatedResponse("Offline"); toast.error('Simulation offline'); }
        finally { setIsSimulating(false); }
      } else { setIsSimulating(false); toast.error('Error', { id: toastId }); }
    } catch (error) { setIsSimulating(false); toast.error('Error', { id: toastId }); }
  };

  const handleSaveEvaluation = async (label) => {
    if (!currentTestRunId) return toast.error("No test to evaluate!");
    setEvaluationLabel(label);
    const toastId = toast.loading('Saving audit log...');
    let riskScore = (label === 'Jailbreak Successful' || label === 'Unsafe') ? 9 : (label === 'Hallucination Triggered') ? 5 : 1;
    try {
      const response = await fetch(API_BASE_URL + '/evaluations/', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ test_run_id: currentTestRunId, label: label, risk_score: riskScore, notes: `Log: ${label}` }) });
      if (response.ok) { await fetchTestRuns(); toast.success(`Log Saved: ${label}`, { id: toastId }); } 
      else { toast.error("Error", { id: toastId }); }
    } catch (error) { toast.error("Error", { id: toastId }); }
  };

  // ================= 6. الصفحات العامة =================
  if (!isLoggedIn) {
    return (
      <div className="public-container">
        <Toaster position="bottom-right" reverseOrder={false} />
        <canvas id="login-canvas"></canvas> 
        <nav className="public-nav">
          <div className="logo-area" onClick={() => setPublicView('landing')} style={{cursor: 'pointer'}}>
            <ShieldAlert className="icon-primary" size={28} /><h2>RedShield</h2>
          </div>
          <div className="nav-actions">
            <button className="btn-ghost" onClick={toggleLang} style={{ fontWeight: 'bold', border: '1px solid #3f3f46', padding: '5px 15px', borderRadius: '20px' }}>
              {lang === 'en' ? 'عربي' : 'English'}
            </button>
            {publicView !== 'landing' && <button className="btn-ghost" onClick={() => setPublicView('landing')}>{t('home') || 'Home'}</button>}
            <button className="btn-outline" onClick={() => setPublicView('login')}>{t('login') || 'Log In'}</button>
            <button className="btn-primary" onClick={() => setPublicView('register')}>{t('signup') || 'Sign Up'}</button>
          </div>
        </nav>

        {publicView === 'landing' && (
          <div className="landing-content">
            <div className="hero-section">
              <div className="hero-badge">{t('heroBadge') || 'AI Security'}</div>
              <h1 className="hero-title">{t('heroTitle1') || 'Test AI before'}<br/><span>{t('heroTitle2') || 'attackers do.'}</span></h1>
              <p className="hero-subtitle">{t('heroSub')}</p>
              <div className="hero-buttons">
                <button className="btn-primary-large" onClick={() => setPublicView('register')}>{t('startTesting') || 'Start'}</button>
                <button className="btn-secondary-large" onClick={() => setPublicView('login')}>{t('accessWorkspace') || 'Login'}</button>
              </div>
            </div>
            <div className="features-grid">
              <div className="feature-card"><Terminal size={32} className="text-primary" /><h3>{t('feat1Title')}</h3><p>{t('feat1Desc')}</p></div>
              <div className="feature-card"><AlertTriangle size={32} className="text-danger" /><h3>{t('feat2Title')}</h3><p>{t('feat2Desc')}</p></div>
              <div className="feature-card"><Layers size={32} className="text-success" /><h3>{t('feat3Title')}</h3><p>{t('feat3Desc')}</p></div>
            </div>
          </div>
        )}

        {publicView === 'login' && (
          <div className="auth-card">
            <div className="login-header"><ShieldAlert className="icon-primary" size={40} /><h2>{t('welcomeBack')}</h2><p>{t('authSubtitleLogin')}</p></div>
            <form onSubmit={handleLogin} className="mini-form">
              <div className="form-group"><label>{t('username')}</label><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required /></div>
              <div className="form-group"><label>{t('password')}</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
              <button type="submit" className="btn-login"><LogIn size={16} /> {t('authBtn')}</button>
            </form>
            <p className="auth-switch">{t('noAccount')} <span onClick={() => setPublicView('register')}>{t('signup')}</span></p>
          </div>
        )}

        {publicView === 'register' && (
          <div className="auth-card">
            <div className="login-header"><CheckCircle2 className="icon-success" size={40} /><h2>{t('createAccount')}</h2><p>{t('authSubtitleReg')}</p></div>
            <form className="mini-form" onSubmit={handleRegister}>
              <div className="form-group"><label>{t('fullName')} </label><input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required /></div>
              <div className="form-group"><label>{t('email')}</label><input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required /></div>
              <div className="form-group"><label>{t('password')}</label><input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required /></div>
              <button type="submit" className="btn-login" style={{background: '#10b981'}}>{t('regBtn')}</button>
            </form>
            <p className="auth-switch">{t('haveAccount')} <span onClick={() => setPublicView('login')}>{t('login')}</span></p>
          </div>
        )}
      </div>
    );
  }

  // ================= 7. لوحة التحكم =================
  return (
    <div className="dashboard-layout">
      <Toaster position="bottom-right" reverseOrder={false} />
      <aside className="sidebar">
        <div className="logo-area"><ShieldAlert className="icon-primary" size={28} /><h2>RedShield <span>Workspace</span></h2></div>
        <nav className="sidebar-nav">
          <button className={currentPage === 'scenarios' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentPage('scenarios')}><Terminal size={18} /> {t('scenarios') || 'Scenarios'}</button>
          <button className={currentPage === 'manual' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentPage('manual')}><ShieldAlert size={18} /> {t('manualTest') || 'Manual Test'}</button>
          <button className={currentPage === 'result' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentPage('result')}><Layers size={18} /> {t('resultPage') || 'Result Page'}</button>
        </nav>
        <button className="btn-logout" onClick={handleLogout}><LogOut size={16} /> {t('clearSession') || 'Logout'}</button>
      </aside>

      <main className="main-content">
        {currentPage === 'scenarios' && (
          <>
            <header className="main-header library-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
              <div><h1>{t('libTitle') || 'Library'}</h1><p className="subtitle">{t('libSub')}</p></div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                
                <select 
                  value={selectedModelId} 
                  onChange={(e) => setSelectedModelId(parseInt(e.target.value))}
                  style={{ background: '#1f2937', color: 'white', border: '1px solid #374151', borderRadius: '6px', padding: '8px 12px', outline: 'none' }}
                >
                  <option value={1}>Gemini 2.5 Pro</option>
                  <option value={2}>Gemini 2.5 Flash</option>
                  <option value={3}>Llama 3 (Groq)</option>
                </select>

                <button 
                  onClick={handleAutoScan} 
                  disabled={isAutoScanning || scenarios.length === 0}
                  style={{ 
                    background: isAutoScanning ? '#6b7280' : '#8b5cf6', 
                    color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', 
                    cursor: (isAutoScanning || scenarios.length === 0) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                  }}
                  title="Run all scenarios against the selected model automatically"
                >
                  <Play size={18} /> {isAutoScanning ? (lang === 'ar' ? 'جاري الفحص...' : 'Scanning...') : (lang === 'ar' ? 'فحص آلي شامل ⚡' : 'Auto-Audit All ⚡')}
                </button>

                {userRole === 1 && <button className="btn-primary-action" onClick={() => setShowAddForm(!showAddForm)} style={{ height: '37px' }}><PlusCircle size={18} /> {t('newScenario') || 'New'}</button>}
              </div>
            </header>

            {showAddForm && userRole === 1 && (
              <div className="form-card-panel">
                <h3>{t('newScenario') || 'New Scenario'}</h3>
                <form onSubmit={handleAddScenario} className="mini-form">
                  <div className="form-group"><label>{t('scenName') || 'Name'}</label><input type="text" value={newScenario.name} onChange={(e) => setNewScenario({...newScenario, name: e.target.value})}/></div>
                  <div className="form-row">
                    <div className="form-group"><label>{t('category') || 'Category'}</label><select value={newScenario.category} onChange={(e) => setNewScenario({...newScenario, category: e.target.value})}><option>Jailbreaking</option><option>Hallucination trigger</option></select></div>
                    <div className="form-group"><label>{t('severity') || 'Severity'}</label><select value={newScenario.severity} onChange={(e) => setNewScenario({...newScenario, severity: e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select></div>
                  </div>
                  <div className="form-group"><label>{t('payload') || 'Payload'}</label><textarea value={newScenario.prompt} onChange={(e) => setNewScenario({...newScenario, prompt: e.target.value})}></textarea></div>
                  <div className="form-actions"><button type="submit" className="btn-submit-form">{t('save') || 'Save'}</button><button type="button" className="btn-cancel-form" onClick={() => setShowAddForm(false)}>{t('cancel') || 'Cancel'}</button></div>
                </form>
              </div>
            )}
            <section className="scenarios-grid">
              {scenarios.map((scen) => (
                <div className="scenario-card" key={scen.id}>
                  <div className="scen-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge badge-${scen.severity.toLowerCase()}`}>{scen.severity}</span>
                    {userRole === 1 && <button onClick={() => handleDeleteScenario(scen.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} color="#ef4444" /></button>}
                  </div>
                  <h3>{scen.title}</h3><span className="scen-cat">{scen.category}</span>
                  <div className="scen-payload"><code>{scen.prompt_text}</code></div>
                </div>
              ))}
            </section>
          </>
        )}

        {currentPage === 'manual' && (
          <>
            <header className="main-header"><h1>{t('manualTitle') || 'Manual Test'}</h1><p className="subtitle">{t('manualSub')}</p></header>
            <div className="workspace-grid">
              <div className="workspace-panel-form">
                <h3>Simulation Config</h3>
                <form onSubmit={handleRunManualTest} className="mini-form">
                  <div className="form-group"><label>{t('targetModel') || 'Model'}</label><select value={selectedModelId} onChange={(e) => setSelectedModelId(parseInt(e.target.value))}><option value={1}>Gemini 2.5 Pro</option><option value={2}>Gemini 2.5 Flash</option><option value={3}>Llama 3 (Groq)</option></select></div>
                  <div className="form-group"><label>{t('attackScen') || 'Scenario'}</label><select value={selectedScenarioId} onChange={(e) => { const val = e.target.value; setSelectedScenarioId(val); const sc = scenarios.find(s => s.id.toString() === val); setManualPrompt(sc ? sc.prompt_text : ''); }}><option value="">{t('customPrompt') || 'Custom'}</option>{scenarios.map((scen) => <option key={scen.id} value={scen.id}>{scen.title}</option>)}</select></div>
                  <div className="form-group"><label>{t('payload') || 'Payload'}</label><textarea value={manualPrompt} onChange={(e) => setManualPrompt(e.target.value)}></textarea></div>
                  <button type="submit" className="btn-run-simulation" disabled={isSimulating}><Play size={16} /> {isSimulating ? (t('attacking') || 'Attacking...') : (t('execute') || 'Execute')}</button>
                </form>
              </div>
              <div className="workspace-panel-results">
                <h3>{t('modelOutput') || 'Output'}</h3>
                <div className="model-response-box">
                  {isSimulating ? <p className="pulse-text">Interrogating target...</p> : simulatedResponse ? <p className="response-text">{simulatedResponse}</p> : <p className="text-muted italic">Awaiting output...</p>}
                </div>
                {simulatedResponse && !isSimulating && (
                  <div className="audit-labelling-zone">
                    <h4>{t('secLabel') || 'Label:'}</h4>
                    <div className="label-buttons-row">
                      <button className="audit-btn safe" onClick={() => handleSaveEvaluation('Safe')}>{t('safe') || 'Safe'}</button>
                      <button className="audit-btn unsafe" onClick={() => handleSaveEvaluation('Unsafe')}>{t('unsafe') || 'Unsafe'}</button>
                      <button className="audit-btn broken" onClick={() => handleSaveEvaluation('Jailbreak Successful')}>{t('jailbreak') || 'Jailbreak'}</button>
                      
                      <button className="audit-btn hallucination" onClick={() => handleSaveEvaluation('Hallucination Triggered')} style={{ borderColor: '#f59e0b', color: '#f59e0b', background: 'transparent', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                        {lang === 'ar' ? 'هلوسة' : 'Hallucination'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {currentPage === 'result' && (
          <>
            <header className="main-header"><h1>{t('resultsTitle') || 'Results'}</h1><p className="subtitle">{t('resultsSub')}</p></header>
            <section className="metrics-grid">
              <div className="metric-card"><div className="metric-header"><span className="text-muted">{t('totalSims') || 'Total'}</span><Terminal size={20} className="text-primary" /></div><div className="metric-value">{recentTests.length}</div></div>
              <div className="metric-card"><div className="metric-header"><span className="text-muted">{t('activeScens') || 'Active'}</span><Layers size={20} className="text-success" /></div><div className="metric-value text-success">{scenarios.length}</div></div>
            </section>
            <section className="table-section">
              <h2>{t('recentLogs') || 'Logs'}</h2>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>{t('testId') || 'ID'}</th><th>{t('targetModel') || 'Model'}</th><th>{t('attackScen') || 'Scenario'}</th><th>{t('runMode') || 'Mode'}</th><th>{t('status') || 'Status'}</th>
                      <th>{t('actions') || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTests.slice().reverse().map((test) => ( 
                      <tr key={test.id}>
                        <td className="font-mono">TR-{test.id}</td>
                        <td style={{ fontWeight: '500' }}>{getModelName(test.model_id)}</td>
                        <td style={{ color: '#a1a1aa' }}>{getScenarioName(test.scenario_id)}</td>
                        <td><span className="badge badge-medium">{test.run_mode === 'manual_custom' ? 'MANUAL' : test.run_mode === 'automated_batch' ? 'AUTO BATCH' : 'LIBRARY'}</span></td>
                        <td><span className={`status-label status-${test.status ? test.status.toLowerCase().replace(/ /g, '-') : 'pending'}`}>{test.status || 'Pending'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button onClick={() => setViewResponseModal({ isOpen: true, data: test })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title={lang === 'ar' ? "عرض الرد" : "View Response"}>
                              <Eye size={18} color="#8b5cf6" />
                            </button>
                            {userRole === 1 && (
                              <button onClick={() => handleDeleteTestRun(test.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }} title="Delete Log">
                                <Trash2 size={16} color="#ef4444" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {viewResponseModal.isOpen && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                <div style={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', padding: '20px', width: '100%', maxWidth: '650px', maxHeight: '80vh', overflowY: 'auto', textAlign: lang === 'ar' ? 'right' : 'left', direction: lang === 'ar' ? 'rtl' : 'ltr', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '8px' }}><Terminal size={20}/> {lang === 'ar' ? 'رد الذكاء الاصطناعي (AI Response)' : 'AI Response'}</h3>
                    <button onClick={() => setViewResponseModal({ isOpen: false, data: null })} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '24px', lineHeight: '1' }}>&times;</button>
                  </div>
                  <div style={{ background: '#0f111a', padding: '15px', borderRadius: '6px', border: '1px solid #27272a', fontFamily: 'monospace', color: '#d1d5db', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px' }}>
                    {viewResponseModal.data?.ai_response ? viewResponseModal.data.ai_response : (lang === 'ar' ? 'لم يتم حفظ الرد لهذا السجل.' : 'No AI response saved for this log.')}
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={() => setViewResponseModal({ isOpen: false, data: null })} style={{ padding: '8px 16px', background: 'transparent', color: '#9ca3af', border: '1px solid #4b5563', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>{lang === 'ar' ? 'إغلاق' : 'Close'}</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
  
}

export default App;