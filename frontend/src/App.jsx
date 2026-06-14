import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal, CheckCircle2, AlertTriangle, Layers, PlusCircle, Play, LogIn, LogOut } from 'lucide-react';
import './App.css';

function App() {
  // إدارة حالة تسجيل الدخول والملاحة بين الصفحات الأربعة
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState('scenarios'); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // متغيرات لتخزين الـ IDs الحقيقية المختارة
  const [selectedModelId, setSelectedModelId] = useState(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  // استمارات التحكم وغرف البيانات التفاعلية
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

  // السيناريوهات المعتمدة من الفريق
  const [scenarios, setScenarios] = useState([]);
  
  // دالة لجلب السيناريوهات من الباك إند
  const fetchScenarios = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/scenarios/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // إرفاق التذكرة الأمنية
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setScenarios(data); // تخزين السيناريوهات القادمة من قاعدة البيانات
      }
    } catch (error) {
      console.error("Error fetching scenarios:", error);
    }
  };

  // تشغيل دالة الجلب تلقائياً بمجرد تسجيل الدخول بنجاح
  useEffect(() => {
    if (isLoggedIn) {
      fetchScenarios();
    }
  }, [isLoggedIn]);

  // جدول النتائج والتجارب الأخيرة لصفحة الـ Result
  // تحويل مصفوفة النتائج إلى مصفوفة فارغة لاستقبال بيانات الباك إند
  const [recentTests, setRecentTests] = useState([]);

  // دالة لجلب عمليات الفحص (Test Runs) من الباك إند
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
        setRecentTests(data); // تخزين العمليات الحقيقية في الـ State
      }
    } catch (error) {
      console.error("Error fetching test runs:", error);
    }
  };

  // تحديث الـ useEffect الحالي ليشمل جلب عمليات الفحص أيضاً عند تسجيل الدخول
  useEffect(() => {
    if (isLoggedIn) {
      fetchScenarios();
      fetchTestRuns(); // جلب العمليات فور الدخول للوحة التحكم
    }
  }, [isLoggedIn]);

  // تأثير تحريك الشبكة العصبية (Particle Network) في خلفية صفحة الدخول
  useEffect(() => {
    // حماية أساسية لمنع تشغيل الأنيميشن في الخلفية بعد تسجيل الدخول
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

  // دالة تسجيل الدخول (مرتبطة بالباك إند)
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    try {
      // تجهيز البيانات بصيغة Form (لأن نظام OAuth2 في FastAPI يطلبها بهذا الشكل)
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      // إرسال الطلب إلى سيرفر الباك إند
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // حفظ التذكرة (Token) في المتصفح لاستخدامها لاحقاً في الطلبات المحمية
        localStorage.setItem('token', data.access_token);
        
        // تحويل المستخدم للوحة التحكم
        setIsLoggedIn(true);
        setCurrentPage('scenarios');
      } else {
        // في حال كانت كلمة المرور خاطئة
        alert('بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('فشل الاتصال بالسيرفر. تأكد من أن سيرفر الباك إند يعمل.');
    }
  };

  // دالة تسجيل الخروج (مسح التذكرة من المتصفح)
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const handleAddScenario = async (e) => {
    e.preventDefault();
    if (!newScenario.name || !newScenario.prompt) return;

    try {
      const token = localStorage.getItem('token');
      // تجهيز البيانات بالأسماء التي تتوقعها قاعدة البيانات (title و prompt_text)
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
        // إعادة جلب القائمة المحدثة من السيرفر مباشرة لضمان مطابقة البيانات
        await fetchScenarios();
        
        // إعادة تصفير الاستمارة وإغلاقها
        setNewScenario({ name: '', category: 'Jailbreaking', severity: 'High', prompt: '' });
        setShowAddForm(false);
      } else {
        alert("فشل حفظ السيناريو في قاعدة البيانات.");
      }
    } catch (error) {
      console.error("Error adding scenario:", error);
      alert("حدث خطأ أثناء الاتصال بالسيرفر.");
    }
  };

  const handleRunManualTest = async (e) => {
    e.preventDefault();
    if (!manualPrompt.trim()) return;

    setIsSimulating(true);
    setSimulatedResponse('');
    setEvaluationLabel('');

    try {
      const token = localStorage.getItem('token');
      // 1. تسجيل عملية الفحص في قاعدة البيانات بالمعرفات الحقيقية
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
        // حفظ رقم العملية (ID) القادم من الخزنة
        setCurrentTestRunId(data.id);

        // 2. إرسال الهجوم الحقيقي إلى السيرفر (OpenAI)
        try {
          const aiResponse = await fetch('http://localhost:8000/simulate-attack/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              prompt: manualPrompt, 
              // إرسال Pro إذا اخترت 1، و Flash إذا اخترت 2
              model_name: selectedModelId === 1 ? "gemini-2.5-pro" : "gemini-2.5-flash" 
            })
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            setSimulatedResponse(aiData.reply);
          } else {
            setSimulatedResponse("حدث خطأ أثناء محاولة جلب الرد من النموذج.");
          }
        } catch (error) {
          console.error("AI Simulation Error:", error);
          setSimulatedResponse("تعذر الاتصال بخادم المحاكاة.");
        } finally {
          setIsSimulating(false);
        }

      } else {
        setIsSimulating(false);
        alert("فشل إنشاء عملية الفحص في السيرفر.");
      }
    } catch (error) {
      console.error("Error creating test run:", error);
      setIsSimulating(false);
      alert("حدث خطأ في الاتصال بالخادم.");
    }
  };

  const handleSaveEvaluation = async (label) => {
    if (!currentTestRunId) {
      alert("لا توجد عملية فحص حالية لتقييمها!");
      return;
    }

    setEvaluationLabel(label);
    
    // تحويل التقييم النصي إلى رقم خطورة (Risk Score) برمجي
    let riskScore = 1;
    if (label === 'Jailbreak Successful' || label === 'Unsafe') riskScore = 9;
    else if (label === 'Hallucination Triggered') riskScore = 5;

    try {
      const token = localStorage.getItem('token');
      const evalData = {
        test_run_id: currentTestRunId, // ربط التقييم برقم العملية
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
        // تحديث جدول صفحة (Result Page) بصمت في الخلفية
        await fetchTestRuns();
      } else {
        alert("فشل حفظ التقييم في السيرفر.");
      }
    } catch (error) {
      console.error("Error saving evaluation:", error);
      alert("حدث خطأ أثناء حفظ التقييم.");
    }
  };

  // ================= 1. PAGE 1: LOGIN ENVIRONMENT =================
  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <canvas id="login-canvas"></canvas>
        
        <div className="login-card">
          <div className="login-header">
            <ShieldAlert className="icon-primary" size={40} />
            <h2>RedShield <span>AI Red Teaming Platform</span></h2>
            <p>Sign in to access the security testing environment</p>
          </div>
          <form onSubmit={handleLogin} className="mini-form">
            <div className="form-group">
              <label>Operator Username</label>
              <input type="text" placeholder="e.g., admin_sec" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Security Token / Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-login">
              <LogIn size={16} /> Authenticate Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ================= لوحة التحكم الأساسية بعد تسجيل الدخول بنجاح =================
  return (
    <div className="dashboard-layout">
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
                  <div className="scen-card-header"><span className="scen-id">{scen.id}</span><span className={`badge badge-${scen.severity.toLowerCase()}`}>{scen.severity}</span></div>
                  <h3>{scen.title}</h3><span className="scen-cat">{scen.category}</span>
                  <div className="scen-payload"><code>{scen.prompt_text}</code></div>
                </div>
              ))}
            </section>
          </>
        )}

        {/* ================= PAGE 3: MANUAL RED TEAMING WORKSPACE ================= */}
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
                    <select 
                      value={selectedModelId} 
                      onChange={(e) => setSelectedModelId(parseInt(e.target.value))}
                    >
                      <option value={1}>Gemini 2.5 Pro (ID: 1)</option>
                      <option value={2}>Gemini 2.5 Flash (ID: 2)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Attack Scenario (From Library)</label>
                    <select 
                      value={selectedScenarioId} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedScenarioId(val);
                        // حركة ذكية: سحب نص السيناريو تلقائياً ووضعه في مربع النص
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
                    {evaluationLabel && <p className="audit-success-msg">✓ Log entry saved locally as: <strong>{evaluationLabel}</strong></p>}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ================= PAGE 4: RESULT PAGE & ANALYTICS ================= */}
        {/* ================= PAGE 4: RESULT PAGE & ANALYTICS ================= */}
{currentPage === 'result' && (
  <>
    <header className="main-header">
      <h1>Evaluation Results & Analytics</h1>
      <p className="subtitle">Comprehensive risk scores and logs compiled from attack runs</p>
    </header>
    
    <section className="metrics-grid">
      <div className="metric-card">
        <div className="metric-header"><span className="text-muted">Total Simulations</span><Terminal size={20} className="text-primary" /></div>
        <div className="metric-value">{recentTests.length}</div> {/* قراءة العدد الفعلي من المصفوفة */}
      </div>
      <div className="metric-card">
        <div className="metric-header"><span className="text-muted">Vulnerabilities Found</span><AlertTriangle size={20} className="text-danger" /></div>
        <div className="metric-value text-danger">1</div> {/* قيمة مؤقتة حتى نربط جدول التقييمات */}
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