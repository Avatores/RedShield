import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal, CheckCircle2, AlertTriangle, Layers, PlusCircle, Play, LogIn, LogOut, Trash2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';

function App() {
  // إدارة حالة تسجيل الدخول والملاحة
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [publicView, setPublicView] = useState('landing');
  const [currentPage, setCurrentPage] = useState('scenarios'); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // متغيرات لتخزين الـ IDs
  const [selectedModelId, setSelectedModelId] = useState(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  
  // استمارات التحكم وغرف البيانات
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [selectedCategory, setSelectedCategory] = useState('Jailbreaking');
  const [manualPrompt, setManualPrompt] = useState('');
  const [simulatedResponse, setSimulatedResponse] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [evaluationLabel, setEvaluationLabel] = useState('');
  const [currentTestRunId, setCurrentTestRunId] = useState(null);
  const [newScenario, setNewScenario] = useState({
    name: '',
    category: 'Jailbreaking',
    severity: 'High',
    prompt: ''
  });

  const [scenarios, setScenarios] = useState([]);
  const [recentTests, setRecentTests] = useState([]);

  const fetchScenarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/scenarios/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    }
  };

  const fetchTestRuns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/test-runs/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecentTests(data);
      }
    } catch (error) {
      console.error("Error fetching test runs:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchScenarios();
      fetchTestRuns();
    }
  }, [isLoggedIn]);

  // تأثير تحريك الشبكة العصبية في الخلفية
  useEffect(() => {
    if (isLoggedIn) return; 

    const canvas = document.getElementById('login-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particlesArray = [];
    const numberOfParticles = 85; 

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() * 0.4) - 0.2; 
        this.speedY = (Math.random() * 0.4) - 0.2;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
      }
      draw() {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)'; 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function init() {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }

    function connect() {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            opacityValue = 1 - (distance / 120);
            ctx.strokeStyle = `rgba(239, 68, 68, ${opacityValue * 0.09})`; 
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    let animationFrameId;
    function animate() {
      const currentCanvas = document.getElementById('login-canvas');
      if (!currentCanvas) return; 

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      connect();
      animationFrameId = requestAnimationFrame(animate);
    }

    init();
    animate();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isLoggedIn]);

  // دوال العمليات (تم إضافة إشعارات Toast الاحترافية)
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    const toastId = toast.loading('Authenticating...');

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setIsLoggedIn(true);
        setCurrentPage('scenarios');
        toast.success('Login successful!', { id: toastId });
      } else {
        toast.error('Incorrect login details, please try again.', { id: toastId });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('فشل الاتصال بالسيرفر. تأكد من عمل الباك إند.', { id: toastId });
    }
  };

  const handleRegister = async (e) => {
  e.preventDefault();
  if (!regName || !regEmail || !regPassword) return;

  const toastId = toast.loading('جاري إنشاء الهوية الأمنية...');

  try {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: regName,
        email: regEmail,
        password: regPassword
      })
    });

    if (response.ok) {
      toast.success('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.', { id: toastId });
      // تفريغ الحقول وتوجيه المستخدم لصفحة الدخول
      setRegName(''); setRegEmail(''); setRegPassword('');
      setPublicView('login'); 
    } else {
      const errData = await response.json();
      toast.error(errData.detail || 'فشل إنشاء الحساب.', { id: toastId });
    }
  } catch (error) {
    console.error("Register error:", error);
    toast.error('حدث خطأ أثناء الاتصال بالخادم.', { id: toastId });
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    toast.success('Log out');
  };

  const handleAddScenario = async (e) => {
    e.preventDefault();
    if (!newScenario.name || !newScenario.prompt) return;

    const toastId = toast.loading('جاري حفظ السيناريو...');

    try {
      const token = localStorage.getItem('token');
      const scenarioData = {
        title: newScenario.name,
        description: "تمت إضافته من الواجهة الأمامية",
        prompt_text: newScenario.prompt,
        category: newScenario.category,
        severity: newScenario.severity
      };

      const response = await fetch('http://localhost:8000/scenarios/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scenarioData)
      });

      if (response.ok) {
        await fetchScenarios();
        setNewScenario({ name: '', category: 'Jailbreaking', severity: 'High', prompt: '' });
        setShowAddForm(false);
        toast.success('The scenario has been successfully added!', { id: toastId });
      } else {
        toast.error('فشل حفظ السيناريو في قاعدة البيانات.', { id: toastId });
      }
    } catch (error) {
      console.error("Error adding scenario:", error);
      toast.error('حدث خطأ أثناء الاتصال بالسيرفر.', { id: toastId });
    }
  };

  // 1. الدالة التي تقوم بالحذف الفعلي (تتنفذ فقط إذا وافق المستخدم)
  const confirmDeleteScenario = async (id) => {
    const toastId = toast.loading('جاري الحذف...');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/scenarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchScenarios();
        toast.success('تم حذف السيناريو بنجاح!', { id: toastId });
      } else {
        toast.error('فشل حذف السيناريو من السيرفر.', { id: toastId });
      }
    } catch (error) {
      console.error("Error deleting scenario:", error);
      toast.error('حدث خطأ أثناء الاتصال بالسيرفر.', { id: toastId });
    }
  };

  // 2. دالة عرض رسالة التأكيد الأنيقة (بديل window.confirm)
  const handleDeleteScenario = (id) => {
    toast((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '250px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
          <AlertTriangle size={20} />
          <span style={{ fontWeight: '600', fontSize: '16px' }}>Confirm Deletion</span>
        </div>
        <span style={{ color: '#d1d5db', fontSize: '14px' }}>Are you sure you want to permanently delete this scenario?</span>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '5px' }}>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{ padding: '6px 12px', background: 'transparent', color: '#9ca3af', border: '1px solid #4b5563', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id); // إخفاء الرسالة
              confirmDeleteScenario(id); // تنفيذ الحذف
            }}
            style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, // الرسالة ستبقى ظاهرة حتى يضغط المستخدم على أحد الزرين
      position: 'top-center',
      style: { background: '#1f2937', border: '1px solid #374151', color: '#fff' }
    });
  };

  const handleRunManualTest = async (e) => {
    e.preventDefault();
    if (!manualPrompt.trim()) return;

    setIsSimulating(true);
    setSimulatedResponse('');
    setEvaluationLabel('');
    const toastId = toast.loading('Initializing attack sequence...');

    try {
      const token = localStorage.getItem('token');
      const testRunData = {
        scenario_id: parseInt(selectedScenarioId) || 1, 
        model_id: selectedModelId,
        run_mode: selectedScenarioId ? "library_scenario" : "manual_custom"
      };

      const response = await fetch('http://localhost:8000/test-runs/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testRunData)
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentTestRunId(data.id);
        toast.success('Attack initialized, waiting for model response...', { id: toastId });

        try {
          const aiResponse = await fetch('http://localhost:8000/simulate-attack/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              prompt: manualPrompt, 
              model_name: selectedModelId === 1 ? "gemini-2.5-pro" : 
                          selectedModelId === 2 ? "gemini-2.5-flash" : 
                          "llama-3.1-8b-instant" 
            })
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            setSimulatedResponse(aiData.reply);
          } else {
            setSimulatedResponse("حدث خطأ أثناء محاولة جلب الرد من النموذج.");
            toast.error('Model response error');
          }
        } catch (error) {
          console.error("AI Simulation Error:", error);
          setSimulatedResponse("تعذر الاتصال بخادم المحاكاة.");
          toast.error('Simulation server offline');
        } finally {
          setIsSimulating(false);
        }

      } else {
        setIsSimulating(false);
        toast.error('فشل إنشاء عملية الفحص في السيرفر.', { id: toastId });
      }
    } catch (error) {
      console.error("Error creating test run:", error);
      setIsSimulating(false);
      toast.error('حدث خطأ في الاتصال بالخادم.', { id: toastId });
    }
  };

  const handleSaveEvaluation = async (label) => {
    if (!currentTestRunId) {
      toast.error("لا توجد عملية فحص حالية لتقييمها!");
      return;
    }

    setEvaluationLabel(label);
    const toastId = toast.loading('Saving audit log...');
    
    let riskScore = 1;
    if (label === 'Jailbreak Successful' || label === 'Unsafe') riskScore = 9;
    else if (label === 'Hallucination Triggered') riskScore = 5;

    try {
      const token = localStorage.getItem('token');
      const evalData = {
        test_run_id: currentTestRunId,
        label: label,
        risk_score: riskScore,
        notes: `تم التقييم اليدوي من قبل المشغل بالنتيجة: ${label}`
      };

      const response = await fetch('http://localhost:8000/evaluations/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(evalData)
      });

      if (response.ok) {
        await fetchTestRuns();
        toast.success(`Audit Log Saved: ${label}`, { id: toastId });
      } else {
        toast.error("فشل حفظ التقييم في السيرفر.", { id: toastId });
      }
    } catch (error) {
      console.error("Error saving evaluation:", error);
      toast.error("حدث خطأ أثناء حفظ التقييم.", { id: toastId });
    }
  };

  // ================= PAGE 1: LOGIN =================
  // ================= الصفحات العامة (قبل تسجيل الدخول) =================
  if (!isLoggedIn) {
    return (
      <div className="public-container">
        <Toaster position="bottom-right" reverseOrder={false} />
        {/* خلفية الشبكة العصبية تعمل على كل الصفحات العامة */}
        <canvas id="login-canvas"></canvas> 
        
        {/* شريط التنقل العلوي */}
        <nav className="public-nav">
          <div className="logo-area" onClick={() => setPublicView('landing')} style={{cursor: 'pointer'}}>
            <ShieldAlert className="icon-primary" size={28} />
            <h2>RedShield</h2>
          </div>
          <div className="nav-actions">
            {publicView !== 'landing' && (
              <button className="btn-ghost" onClick={() => setPublicView('landing')}>Home</button>
            )}
            <button className="btn-outline" onClick={() => setPublicView('login')}>Log In</button>
            <button className="btn-primary" onClick={() => setPublicView('register')}>Sign Up</button>
          </div>
        </nav>

        {/* 1. صفحة الهبوط (Landing Page) */}
        {publicView === 'landing' && (
          <div className="landing-content">
            <div className="hero-section">
              <div className="hero-badge">AI Security Starts Before Deployment</div>
              <h1 className="hero-title">Test AI before<br/><span>attackers do.</span></h1>
              <p className="hero-subtitle">
                Built for AI red teaming and security testing to simulate attacks, 
                audit model responses, and uncover vulnerabilities.
              </p>
              <div className="hero-buttons">
                <button className="btn-primary-large" onClick={() => setPublicView('register')}>Start Testing Now</button>
                <button className="btn-secondary-large" onClick={() => setPublicView('login')}>Access Workspace</button>
              </div>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <Terminal size={32} className="text-primary" />
                <h3>Adversarial Simulation</h3>
                <p>Deploy advanced jailbreaks and prompt injections to test AI boundaries.</p>
              </div>
              <div className="feature-card">
                <AlertTriangle size={32} className="text-danger" />
                <h3>Vulnerability Auditing</h3>
                <p>Log, label, and analyze hallucination triggers and unsafe AI behaviors.</p>
              </div>
              <div className="feature-card">
                <Layers size={32} className="text-success" />
                <h3>Multi-Model Support</h3>
                <p>Test Gemini, Llama, and GPT architectures simultaneously in one workspace.</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. صفحة تسجيل الدخول (Login) */}
        {publicView === 'login' && (
          <div className="auth-card">
            <div className="login-header">
              <ShieldAlert className="icon-primary" size={40} />
              <h2>Welcome Back</h2>
              <p>Access your RedShield workspace</p>
            </div>
            <form onSubmit={handleLogin} className="mini-form">
              <div className="form-group">
                <label>Username</label>
                <input type="text" placeholder="e.g., admin_sec" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-login"><LogIn size={16} /> Authenticate</button>
            </form>
            <p className="auth-switch">Don't have an account? <span onClick={() => setPublicView('register')}>Sign up here</span></p>
          </div>
        )}

        {/* 3. صفحة إنشاء حساب (Register) - الواجهة فقط حالياً */}
        {publicView === 'register' && (
          <div className="auth-card">
            <div className="login-header">
              <CheckCircle2 className="icon-success" size={40} />
              <h2>Create Account</h2>
              <p>Join the Red Team platform</p>
            </div>
            <form className="mini-form" onSubmit={handleRegister}>
             <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Your Name" value={regName} onChange={(e) => setRegName(e.target.value)} required />
             </div>
             <div className="form-group">
               <label>Email</label>
               <input type="email" placeholder="email@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
             </div>
             <div className="form-group">
               <label>Password</label>
               <input type="password" placeholder="••••••••" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
             </div>
             <button type="submit" className="btn-login" style={{background: '#10b981'}}>Create Operator Profile</button>
            </form>
            <p className="auth-switch">Already have an account? <span onClick={() => setPublicView('login')}>Log in here</span></p>
          </div>
        )}
      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div className="dashboard-layout">
      <Toaster position="bottom-right" reverseOrder={false} />
      <aside className="sidebar">
        <div className="logo-area">
          <ShieldAlert className="icon-primary" size={28} />
          <h2>RedShield <span>Workspace</span></h2>
        </div>
        <nav className="sidebar-nav">
          <button className={currentPage === 'scenarios' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentPage('scenarios')}><Terminal size={18} /> Scenarios</button>
          <button className={currentPage === 'manual' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentPage('manual')}><ShieldAlert size={18} /> Manual Test</button>
          <button className={currentPage === 'result' ? 'nav-btn active' : 'nav-btn'} onClick={() => setCurrentPage('result')}><Layers size={18} /> Result Page</button>
        </nav>
        <button className="btn-logout" onClick={handleLogout}><LogOut size={16} /> Clear Session</button>
      </aside>

      <main className="main-content">
        
        {/* ================= PAGE 2: SCENARIOS LIBRARY ================= */}
        {currentPage === 'scenarios' && (
          <>
            <header className="main-header library-header">
              <div>
                <h1>Attack Scenario Library</h1>
                <p className="subtitle">Manage and deploy adversarial prompts designed to test LLM boundaries</p>
              </div>
              <button className="btn-primary-action" onClick={() => setShowAddForm(!showAddForm)}><PlusCircle size={18} /> New Scenario</button>
            </header>
            {showAddForm && (
              <div className="form-card-panel">
                <h3>Create New Attack Scenario</h3>
                <form onSubmit={handleAddScenario} className="mini-form">
                  <div className="form-group"><label>Scenario Name</label><input type="text" placeholder="e.g., Base64 Encoded Jailbreak" value={newScenario.name} onChange={(e) => setNewScenario({...newScenario, name: e.target.value})}/></div>
                  <div className="form-row">
                    <div className="form-group"><label>Category</label><select value={newScenario.category} onChange={(e) => setNewScenario({...newScenario, category: e.target.value})}><option>Jailbreaking</option><option>Hallucination trigger</option></select></div>
                    <div className="form-group"><label>Severity Level</label><select value={newScenario.severity} onChange={(e) => setNewScenario({...newScenario, severity: e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select></div>
                  </div>
                  <div className="form-group"><label>Adversarial Prompt Payload</label><textarea placeholder="Enter the malicious prompt here..." value={newScenario.prompt} onChange={(e) => setNewScenario({...newScenario, prompt: e.target.value})}></textarea></div>
                  <div className="form-actions"><button type="submit" className="btn-submit-form">Save Scenario</button><button type="button" className="btn-cancel-form" onClick={() => setShowAddForm(false)}>Cancel</button></div>
                </form>
              </div>
            )}
            <section className="scenarios-grid">
              {scenarios.map((scen) => (
                <div className="scenario-card" key={scen.id}>
                  <div className="scen-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className={`badge badge-${scen.severity.toLowerCase()}`}>{scen.severity}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteScenario(scen.id)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                      title="Delete Scenario"
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </button>
                  </div>
                  <h3>{scen.title}</h3>
                  <span className="scen-cat">{scen.category}</span>
                  <div className="scen-payload"><code>{scen.prompt_text}</code></div>
                </div>
              ))}
            </section>
          </>
        )}

        {/* ================= PAGE 3: MANUAL RED TEAMING ================= */}
        {currentPage === 'manual' && (
          <>
            <header className="main-header">
              <h1>Manual Red Teaming Workspace</h1>
              <p className="subtitle">Execute manual attacks against target models and audit responses</p>
            </header>
            <div className="workspace-grid">
              <div className="workspace-panel-form">
                <h3>Simulation Config</h3>
                <form onSubmit={handleRunManualTest} className="mini-form">
                  <div className="form-group">
                    <label>Target Model</label>
                    <select value={selectedModelId} onChange={(e) => setSelectedModelId(parseInt(e.target.value))}>
                      <option value={1}>Gemini 2.5 Pro (ID: 1)</option>
                      <option value={2}>Gemini 2.5 Flash (ID: 2)</option>
                      <option value={3}>Llama 3 (Groq) (ID: 3)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Attack Scenario (From Library)</label>
                    <select 
                      value={selectedScenarioId} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedScenarioId(val);
                        const chosenScen = scenarios.find(s => s.id.toString() === val);
                        if(chosenScen) setManualPrompt(chosenScen.prompt_text);
                        else setManualPrompt('');
                      }}
                    >
                      <option value="">-- Custom Manual Prompt --</option>
                      {scenarios.map((scen) => (
                        <option key={scen.id} value={scen.id}>
                          {scen.title} (ID: {scen.id})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Adversarial Prompt Payload</label>
                    <textarea 
                      placeholder="Type custom attack prompt or select from library above..." 
                      value={manualPrompt} 
                      onChange={(e) => setManualPrompt(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="btn-run-simulation" disabled={isSimulating}>
                    <Play size={16} /> {isSimulating ? 'Attacking Model...' : 'Execute Attack'}
                  </button>
                </form>
              </div>
              <div className="workspace-panel-results">
                <h3>Model Output & Audit Logs</h3>
                <div className="model-response-box">
                  {isSimulating && <p className="pulse-text">Interrogating target LLM boundaries...</p>}
                  {!isSimulating && simulatedResponse && <p className="response-text">{simulatedResponse}</p>}
                  {!isSimulating && !simulatedResponse && <p className="text-muted italic">Awaiting attack execution log output...</p>}
                </div>
                {simulatedResponse && !isSimulating && (
                  <div className="audit-labelling-zone">
                    <h4>Security Label Audit Selection:</h4>
                    <div className="label-buttons-row">
                      <button className="audit-btn safe" onClick={() => handleSaveEvaluation('Safe')}>Safe</button>
                      <button className="audit-btn unsafe" onClick={() => handleSaveEvaluation('Unsafe')}>Unsafe</button>
                      <button className="audit-btn broken" onClick={() => handleSaveEvaluation('Jailbreak Successful')}>Jailbreak</button>
                      <button className="audit-btn hallucinate" onClick={() => handleSaveEvaluation('Hallucination Triggered')}>Hallucination</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ================= PAGE 4: RESULT PAGE ================= */}
        {currentPage === 'result' && (
          <>
            <header className="main-header">
              <h1>Evaluation Results & Analytics</h1>
              <p className="subtitle">Comprehensive risk scores and logs compiled from attack runs</p>
            </header>
            
            <section className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header"><span className="text-muted">Total Simulations</span><Terminal size={20} className="text-primary" /></div>
                <div className="metric-value">{recentTests.length}</div> 
              </div>
              <div className="metric-card">
                <div className="metric-header"><span className="text-muted">Vulnerabilities Found</span><AlertTriangle size={20} className="text-danger" /></div>
                <div className="metric-value text-danger">1</div> 
              </div>
              <div className="metric-card">
                <div className="metric-header"><span className="text-muted">Active Scenarios</span><Layers size={20} className="text-success" /></div>
                <div className="metric-value text-success">{scenarios.length}</div>
              </div>
            </section>

            <section className="table-section">
              <h2>Recent Audit Logs & Output Status</h2>
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Test ID</th>
                      <th>Target Model ID</th>
                      <th>Attack Scenario ID</th>
                      <th>Run Mode</th>
                      <th>Outcome Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTests.map((test) => (
                      <tr key={test.id}>
                        <td className="font-mono">TR-{test.id}</td>
                        <td>Model #{test.model_id}</td>
                        <td>Scenario #{test.scenario_id}</td>
                        <td><span className="badge badge-medium">{test.run_mode}</span></td>
                        <td>
                          <span className={`status-label status-${test.status.toLowerCase()}`}>
                            {test.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

      </main>
    </div>
  );
}

export default App;