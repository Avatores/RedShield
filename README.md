# 🛡️ RedShield | Advanced LLM Vulnerability Scanner

RedShield is a comprehensive, full-stack cybersecurity platform designed to rigorously test, audit, and evaluate Large Language Models (LLMs) against severe security vulnerabilities, including Jailbreaking, Prompt Injections, and Hallucination triggers. 

Developed as a capstone project for the AI Security Bootcamp, RedShield empowers security teams to safely simulate attacks and measure model resilience before deployment.

## ✨ Key Features

* **Automated Batch Scanning (Auto-Audit ⚡):** Execute a comprehensive library of specialized attack payloads against selected AI models with a single click.
* **Manual Interrogation Lab:** Manually interrogate models in real-time using custom prompts, and evaluate their responses instantly.
* **Threat Categorization:** Precisely classify vulnerabilities into actionable labels (Safe, Unsafe, Jailbreak Successful, Hallucination Triggered).
* **Multi-Model Integration:** Seamlessly supports multiple state-of-the-art LLMs, including Google Gemini (2.5 Pro & Flash) and Meta Llama 3 (via Groq).
* **Comprehensive Logging:** Tracks every test run with detailed metrics, status indicators, and full AI response histories for post-incident analysis.

## 🛠️ Tech Stack

**Frontend Architecture:**
* React.js (Vite)
* Lucide Icons (UI Elements)
* React Hot Toast (Notifications)
* Custom CSS & Responsive UI

**Backend Architecture:**
* Python & FastAPI
* SQLite & SQLAlchemy ORM
* Uvicorn (ASGI Server)
* Pydantic (Data Validation)

**AI & Cloud Integrations:**
* Google Generative AI API
* Groq API (Inference Engine)

## 🚀 Getting Started (Local Deployment)

Follow these steps to deploy and run RedShield locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/Avatores/RedShield.git](https://github.com/Avatores/RedShield.git)
cd RedShield
```
#### 2. Backend Setup:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # For Windows
# source venv/bin/activate  # For macOS/Linux
pip install -r requirements.txt
```
# Environment Configuration:
## Create a (.env) file in the root of the backend directory and add your API credentials:

GEMINI_API_KEY=your_google_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

### Run the Backend Server:
```bash
uvicorn main:app --reload
The API will start running on http://localhost:8000.
```

### 3. Frontend Setup
## Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```
### The web interface will be available at http://localhost:5173

### System Access & Usage

### For security purposes, RedShield does not include hardcoded default credentials. To access the workspace:

### 1- Open the application in your browser (http://localhost:5173)

### 2- Navigate to the Sign Up page.

### 3- Create a new operator account (e.g., yourname@redshield.com).

### 4- Log in with your new credentials to access the RedShield Dashboard and start running security audits.