# 🎯 AI Study Copilot

> A high-fidelity, all-in-one educational workspace powered by React, Node.js, and Google's Gemini API. Designed to act as a synchronized personal teacher, expert scheduler, robust document note extractor, instant blackboard tutor, and realistic licensing board exam simulator. 

---

## 🌟 Why We Built This: Disrupting the Fragmented & Paid EdTech Market

In today's digital learning landscape, preparing for complex high-stakes examinations (such as **USMLE**, **UPSC**, **CFA**, **IIT JEE**, **Bar Exams**, or mathematical sciences) is a highly fragmented and unnecessarily expensive struggle. 

### ❌ The Real Problem with Modern EdTech:
1. **Aggressive Paywalls & Subscription Fatigue:** 
   If you look at the applications available today, almost all of them require buying a monthly subscription. They only give you 2 to 4 basic features in a single app (e.g. just simple flashcards or a basic planning calendar) but lock the truly powerful features (like custom exam simulations, document parsing, and interactive blackboard derivation engines) behind aggressive premium paywalls.
2. **The "Disjointed Tool" Headache:** 
   To study effectively, a student is forced to switch between 10 different tools:
   * **App 1** for study calendar planning ($10/month)
   * **App 2** for doubt solving / tutoring ($20/month)
   * **App 3** for managing a textbook notes library ($15/month)
   * **App 4** for creating practice quizzes ($10/month)
   * **App 5** for simulation boards like USMLE, UPSC, or JEE practice banks ($150-$300 total)
   * **App 6** to scan homework papers or capture worksheet screenshots
3. **No Central Synergy:** 
   Because all these tools are completely disconnected, your planner doesn't know what you took notes on, your quizzes don't adapt to your simulator weak spots, and you lose your study streaks because your tracking data is spread over 4 completely different accounts.

---

### ⚡ The AI Study Copilot Solution: All-in-One Educational Synergy
We created **AI Study Copilot** to challenge this model completely. This is the **only platform in the world** that packages every single one of these elite academic tools under **one single, beautifully synchronized, and free dashboard**. 

By unifying your workspace, we remove both financial barriers and context-switching fatigue, allowing you to focus purely on mastering your syllabus:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      🎯 AI STUDY COPILOT WORKSPACE                      │
├───────────────────┬───────────────────┬────────────────────────────────┤
│  STUDY WORKSPACE  │   ACADEMIC TOOLS  │      PROGRESS & HABITS         │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ 📅 Smart Planner  │ 🧠 Doubt AI Agent │ 📉 Live Performance Analytics  │
│ ✍️ Note Generator │ ❓ Practice Quiz  │ 🔥 4+ Day Fire Streak Counter  │
│ 📷 Worksheet OCR  │ 🧑‍🏫 Blackboard Live │ 🏆 Custom Achievements Badges │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

```
                            ┌────────────────────────┐
                            │    GLOBAL DISCIPLINE   │
                            │      DOMAIN HUB        │
                            └───────────┬────────────┘
                                        │ (Syncs Focus)
     ┌──────────────────┬───────────────┼───────────────┬──────────────────┐
     ▼                  ▼               ▼               ▼                  ▼
┌──────────┐      ┌──────────┐    ┌──────────┐    ┌──────────┐       ┌──────────┐
│ Planner  │      │ Notebook │    │ Doubt AI │    │ Live CRM │       │ Exam Sim │
│ Roadmap  │      │ Summaries│    │ Tutor    │    │ Whitebd  │       │ Analytics│
└──────────┘      └──────────┘    └──────────┘    └──────────┘       └──────────┘
```

---

## 🧭 In-Depth Feature Tour

### 1. 🌐 Global Domain Hub & Tag System
The entire platform conforms on-demand to your active workspace. With both a visual dropdown selector and an interactive, horizontal scrolling quick-tag panel, users can orient the app toward specific fields:
* **Economics:** Macroeconomic IS-LM curves, Game Theory Nash Equilibrium, and transmission models.
* **Law & Jurisprudence:** Constitutional Separation of Powers, Torts, double taxation relief, and contracts.
* **Medicine & Pathology:** Pathophysiology of metabolic diseases, drug pharmacokinetics, and EKG reviews.
* **Engineering & Physics:** Structural Finite Element Analysis, thermodynamics, boundary layer systems, and special relativity.
* **Actuarial Science & Finance:** Stochastic claim modeling, life annuity continuances, and surplus equations.
* **And More:** Informatics (algorithms), Chemistry (reaction kinetics, stereochemistry), Mathematics, and Biology.
* **How it works:** Selecting a domain automatically updates recommended syllabus subtopics, filters your displayed note lists, and prepopulates prompt shortcuts.

### 2. 📅 Smart Study Planner & Budget Scheduler
Say goodbye to static, un-adaptable calendars. Under the *Smart Planner*, you can type in your specific subject lists, select a target exam date, and allocate a daily hourly budget.
* **AI Engine Generation:** The scheduler calls our Express API proxy which leverages **Gemini** to calculate exact study phases (e.g., Foundation, High-Yield Deep Dive, Active Practice, Final Recovery).
* **Automatic Topic Weighting:** It identifies high, medium, and low-priority concepts relative to historic examination patterns of the selected domain.
* **Actionable Milestones:** Generates direct checkboxes so you can visually click through tasks as you complete them.

### 3. ✍️ Generative Textbook Note Library
Creating clear, beautifully structured study notes shouldn't take hours of manual copy-pasting.
* **Instant Topic Structuring:** Type in any technical concept or choose from high-yield recommendations, and receive textbook-format study pages featuring comprehensive sections: Core Concept Definitions, Detailed Formulas, Derivations, and Step-by-Step Sample Problems.
* **Formulas & Code Blocks:** Styled using clean monospace block containers for absolute clarity.
* **Active Note Storage:** Save generated reference sheets dynamically inside your permanent study shelf.

### 4. 📷 Homework Scanner & Worksheets Extractor
If you have handwritten papers, equations typed on screens, complex textbook chapters, or screenshot exam questions, utilize this drag-and-drop or select module.
* **Metadata Parsing:** Simulates full-spectrum optical character recognition (OCR) and files data analysis.
* **Auto-Annotation:** Extracts formulas, identifies variables, builds detailed summary guides, and places them directly into your *Notes Library* where they can be printed, edited, or instantly converted into customized practice tests.

### 5. ❓ Automated Custom Quizzes
Active recall is the most scientifically proven method to retain tough parameters.
* **One-Click Generation:** Transform any saved topic in your note library, or manually entered test requirements, into custom, instantly gradable mock multiple-choice question sets.
* **Detailed Explanation Key:** When checked, the system doesn't just reveal the correct answer but provides an exhaustive explanation detailing *why* the other answers are incorrect distractors.

### 6. 📝 High-Fidelity Exam Simulator
Engineered to replicate the real-time pressure, formatting, and strict grading mechanics of elite international certification boards.
* **Preselected Presets:**
  * **USMLE Step 1:** Focuses on Clinical Pathophysiology, multi-organ symptom clusters, and drug pharmacology.
  * **UPSC Civil Services:** Includes complex, structural Indian Constitutional law questions, governance, and history.
  * **IIT JEE Advanced:** Testing physical derivations, abstract calculus, and structural kinetics.
  * **Actuarial Risk Models:** Poisson process distributions, Brownian options, mathematical life contingencies, and Lundberg formulas.
* **The Environment:** Displays a structured timer, side navigation tree, and a "Flag for Review" checklist.
* **Evaluator Critique:** Upon submission, you are not simply given a raw score. The AI conducts a comprehensive, multi-point **Board Evaluator Review** analyzing your time distribution, logical vulnerabilities, and critical thinking process.

### 7. 🧑‍🏫 Live AI Blackboard Room
An active whiteboard workspace modeled after direct one-on-one virtual teacher consults.
* **Active Interactive Console:** Type individual mathematical proofs, block code requests, or conceptual questions.
* **Visual Chalkboard:** The AI tutor simulates real-time chalk-style blackboard derivation routines.
* **Step-by-Step Learning:** Allows you to break down complex proofs line-by-line rather than dumping all calculations at once.

### 8. 📉 Fire Streak & Badges Hub
Unlocks psychological gamification patterns to build healthy, daily studying habits.
* **Active Fire Streaks:** Dynamically monitors when you take actions (solving doubts, reading notes, generated schedulers, scoring well in simulations) and keeps your daily streak actively burning.
* **Unlockable Milestones:** Earn specific graphic achievements (like the *Notes Titan*, *Simulator Conqueror*, or *Scholar Mind*) to visually track and motivate your persistent academic journey.

---

## 🎯 Head-to-Head Comparison: Free Unified App vs. Paid Premium Services

| Feature Module | AI Study Copilot | Typical Online Alternatives (Paid/Subscription Only) |
| :--- | :--- | :--- |
| **Study Planner** | **Included Free** - Dynamic AI schedule mapping based on exam date & hourly capacity. | $10-$20/month specialized planning services. |
| **Exam Simulator** | **Included Free** - Custom Presets (USMLE, UPSC, Actuarial) with Evaluator Reviews. | $200-$400 specialized board-sim question banks. |
| **Notes Extractor** | **Included Free** - Upload PDFs, handwritings, or text worksheets to extract guides. | $15/month OCR and document reading integrations. |
| **Step-by-Step Tutor**| **Included Free** - Live digital chalkboard room explaining derivations collaboratively. | $30/hour specialized human tutor rates. |
| **Active Quizzes** | **Included Free** - Infinite auto-generated MCQs with logical feedback keys. | Restricted features on basic web accounts. |

---

## 🛠️ Comprehensive Technology Stack

### 🖥️ Client (Front-End Architecture)
* **Framework:** **React 18** with functional components and structured hooks.
* **Typing Interface:** **TypeScript** configured in strict mode to eradicate runtime reference crashes.
* **Compilation Utility:** **Vite** running client-side on an optimized, direct bundle layout.
* **Design Engine:** **Tailwind CSS** utilizing an eye-safe, ultra-modern **Cosmic Slate Theme** (deep slate blues, clean warm off-whites, and vivid accent indicators).
* **Movement Dynamics:** Full-spectrum **Motion** (from `motion/react`) managing smooth fade-ins, sliding panel transitions, and interactive scale states.
* **Layout Icons:** Standardized vector rendering using **Lucide React** (no heavy SVG loads).

### ⚙️ Backend (Server Architecture)
* **Runtime:** **Node.js** paired with **Express**.
* **Proxy Safety Security:** Implements absolute server-side protection. All communications going to third-party endpoints or Google Gen AI go through a structured Express router path, keeping local environment variables and sensitive API keys completely invisible to client browser inspector logs.
* **Fast-Start Packaging:** Utilizes an customized **Esbuild** system which bundles server assets into a single compiled CommonJS output (`dist/server.cjs`), eliminating slow container booting on modern cloud hosts.

### 🧠 Core Intelligence
* **Model Engine:** **Gemini 2.5 Flash** integrated using the official, high-performance `@google/genai` TypeScript client SDK.
* **Structured Prompts:** Programmed with rigorous system role framing, ensuring output responses conform to standard, readable **Markdown syntax** complete with clean bulleting, bold parameters, and correct code structures.

---

## 💻 Local Quick Install, Run & Deployment Guide

### Prerequisites
* **Node.js** (v18 or higher recommended)
* A valid **Gemini API Key** (Accessible from Google AI Studio)

---

### Step 1: Clone & Navigate to Project Root
Ensure you are inside the directory containing the project.
```bash
cd ai-study-copilot
```

---

### Step 2: Install Package Dependencies
Run npm installer (which will fetch all front-end and server packages specified in our locked `package.json`):
```bash
npm install
```

---

### Step 3: Configure Your Safe Environment File
Create a `.env` file in the root of your project space and add your API key:
```env
# Absolute secret key. Kept completely invisible to browser front-ends.
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### Step 4: Boot the Developer Sandbox
Start the combined dev server on standard port `3000`:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser. Note: Port 3000 is our hardcoded routing channel.

---

### Step 5: Production Build & Standalone Run
To bundle static assets, compile the ES Node server into our optimized `dist/server.cjs` format, and boot:
```bash
# Compile and Bundle
npm run build

# Boot the Standalone Production App
npm start
```

---

## 📐 Layout & Code Cleanliness Principles

* **Single-View Desktop & Mobile Flexibility:** Grid-based margins that use responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`) seamlessly.
* **No Telemetry Clutter:** Zero unrequested status logs, port displays, or low-quality telemetry labels. Human-first labels are used exclusively across every tab view.
* **Strict API Key Safety:** We never write `VITE_GEMINI_API_KEY`. The frontend talks to `/api/*` proxies, keeping all authorization signatures secure in cloud runtime environments.
