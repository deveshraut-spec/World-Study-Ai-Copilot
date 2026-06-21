import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing requests
app.use(express.json({ limit: "20mb" }));

// Initialize the Google Gemini GenAI SDK server-side
// Using the recommended Named Parameter format and adding custom AI Studio User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper model - gemini-3.5-flash is our standard for these student features
const MODEL_NAME = "gemini-3.5-flash";

// Check health
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// 1. Doubt Solver Route (handles textual/simulated-voice question solving)
app.post("/api/doubt-solve", async (req, res) => {
  try {
    const { question, mode, history } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const modeInstructions = {
      simple: "Explain like I am 8 years old. Use extremely simple terms, funny real-world metaphors, simple analogies, and zero complex jargon. Use a warm, encouraging sibling-like tone, primarily in friendly English with a pinch of clean Hinglish if appropriate.",
      medium: "Explain like a standard high-school tutor. Be direct, clear, structured, and logical. Use bullet points for steps, detail key formulas in easy steps, and explain the why behind the steps in high-quality English/Hinglish.",
      advanced: "Explain like a strict, brilliant college professor or expert scholar. Provide complete mathematical derivations, deep technical concepts, rigorous theoretical proofs, reference advanced topics, and maintain professional scholarly language.",
    };

    const activeInstruction = modeInstructions[mode as keyof typeof modeInstructions] || modeInstructions.medium;

    // We build contents list representing the chat conversation history + the new question
    const contents: any[] = [];
    
    // Add history if present
    if (Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }

    // Add the current prompt
    contents.push({
      role: "user",
      parts: [
        {
          text: `You are a warm, highly-supportive AI Study Copilot. Solve the following academic doubt or question.\n\nDifficulty/Persona Mode: ${activeInstruction}\n\nQuestion: "${question}"\n\nProvide the response with markdown format. Underline key terms using double asterisks and list formulas beautifully.`,
        },
      ],
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
    });

    const explanation = response.text || "Sorry, I spent too long thinking and couldn't formulate a response. Please try reframing your question!";
    res.json({ explanation });
  } catch (error: any) {
    console.error("Doubt solver failed:", error);
    res.status(500).json({ error: error?.message || "Internal GenAI Server Error" });
  }
});

// 2. Automated Notes Generator Route
app.post("/api/generate-notes", async (req, res) => {
  try {
    const { topic, subject } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `You are an expert AI Educator who creates premium, textbook-style study notes.\nCreate detailed, beautiful, highly comprehensive study notes for the subject "${subject || "General Science/Studies"}" on the topic: "${topic}".\n\nThe notes must contain:\n1. **Session Overview**: Brief, catchy intro of why this topic matters.\n2. **Core Concepts**: Elaborate with elegant explanations, subtopics, and real-world examples.\n3. **Important Formulas & Derivations** (if applicable, formatted clearly in blocks).\n4. **Important Points to Remember** (Quick reference points).\n5. **Illustrative Example Problem**: Provide a practice question, step-by-step master solution, and explanation.\n\nUse clear Markdown heading structure (h1, h2, h3), clear bullet points, bold highlights, and clean layouts. Write in energetic English with a warm academic support feel.`,
    });

    res.json({ notes: response.text });
  } catch (error: any) {
    console.error("Notes generation failed:", error);
    res.status(500).json({ error: error?.message || "Could not generate notes." });
  }
});

// 3. Automated Quiz Creator (Returns absolute strict JSON structure)
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { topic, notesContent, settings } = req.body;
    const numQ = settings?.numQuestions || 5;
    const qType = settings?.type || "mixed"; // "mcq", "short", "long", "mixed"

    const prompt = `Create a real mock practice academic test quiz on the topic: "${topic || "General Studies"}".
${notesContent ? `Base the questions on these uploaded textbook/notes content:\n--- \n${notesContent}\n---\n` : ""}
Create exactly ${numQ} high-quality, testing questions.
Question mix should be targeted to: ${qType} questions.

Strict JSON Output format requirements:
Must return an object containing a list with key "questions".
Each question item MUST have:
1. "id": string key, e.g. "q_1", "q_2", ...
2. "question": string, the academic question text
3. "type": "mcq", "short", or "long" (Ensure match or variety as instructed by user)
4. "options": string list containing exactly 4 options (ONLY if type is "mcq", else empty list or omit)
5. "correctAnswer": string, for "mcq" this must match the correct option EXACTLY. For "short" or "long", this must be the ideal model answer keys/points expected from the student.
6. "explain": string explaining the concept behind the correct answer in detail.

Do not wrap the response in any markdown codeblock headers like \`\`\`json. Return pure JSON output.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: "The list of generated questions",
              items: {
                type: Type.OBJECT,
                required: ["id", "question", "type", "correctAnswer", "explain"],
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["mcq", "short", "long"] },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "MCQ choices, maximum/exactly 4 items"
                  },
                  correctAnswer: { type: Type.STRING, description: "Correct choice or model expected answer description" },
                  explain: { type: Type.STRING }
                }
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    const rawText = response.text || "{}";
    let quizData;
    try {
      quizData = JSON.parse(rawText.trim());
    } catch (parseErr) {
      console.error("Failed to parse JSON response:", rawText);
      throw new Error("AI returned malformed JSON for the quiz. Let's try again!");
    }

    res.json(quizData);
  } catch (error: any) {
    console.error("Quiz generator failed:", error);
    res.status(500).json({ error: error?.message || "Could not generate custom quiz." });
  }
});

// 4. Analyze quiz answers submitted by the student
app.post("/api/analyze-test", async (req, res) => {
  try {
    const { questions, userAnswers } = req.body;

    if (!questions || !userAnswers) {
      return res.status(400).json({ error: "Questions and user answers are required for evaluation." });
    }

    const payload = {
      questions,
      studentSubmissions: userAnswers
    };

    const prompt = `You are a meticulous, supportive school board evaluator and tutor. Analyze the student's test submissions against the questions and correct/model answers provided below.
Provide a high-fidelity diagnostic assessment of their performance in JSON form.

Input Data:
${JSON.stringify(payload, null, 2)}

Strict JSON Output format requirements:
Must return an object containing keys:
1. "score": number. Total score achieved (each MCQ is 10 points. Short answers graded 0-10 based on keywords matched. Long graded 0-10 based on comprehensiveness).
2. "total": number. Total maximum points possible.
3. "evaluations": array of evaluation objects. For each question, compile:
   - "questionId": string, the id matching input questions
   - "studentAnswer": string, what student provided
   - "correct": boolean (or true/false/partial)
   - "gradeScore": number, points awarded for this answer (0 to 10)
   - "feedback": string. Explain exactly what they did right, or what was key/formula missing in their response. Keep it encouraging!
4. "weakTopics": string list of academic areas/subtopics identified as weak or needing immediate attention.
5. "improvementSuggestions": string list of tangible, concrete action points (e.g. "Focus on standard thermodynamics equations", "Use Units during calculations").
6. "streakAchievementMatched": boolean, true if accuracy is high or performance shows good grit.

Do not wrap the response in any markdown codeblock markings. Return pure JSON output.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "total", "evaluations", "weakTopics", "improvementSuggestions"],
          properties: {
            score: { type: Type.INTEGER },
            total: { type: Type.INTEGER },
            evaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["questionId", "studentAnswer", "correct", "gradeScore", "feedback"],
                properties: {
                  questionId: { type: Type.STRING },
                  studentAnswer: { type: Type.STRING },
                  correct: { type: Type.BOOLEAN },
                  gradeScore: { type: Type.INTEGER },
                  feedback: { type: Type.STRING }
                }
              }
            },
            weakTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            improvementSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Test analyzer failed:", error);
    res.status(500).json({ error: error?.message || "Evaluation failed." });
  }
});

// 5. Smart Study Planner & Revision Scheduler Route
app.post("/api/create-planner", async (req, res) => {
  try {
    const { subjects, examDate, dailyHours } = req.body;

    if (!subjects || !examDate) {
      return res.status(400).json({ error: "Subjects and target exam date are required." });
    }

    const prompt = `You are a premium university administrative study scheduler. 
The student is preparing for an exam on: ${examDate}.
The subjects they need to clear: ${JSON.stringify(subjects)}.
Daily study hours available to invest: ${dailyHours || 3} hours.
The current date today is: 2026-06-18.

Generate a highly strategic, daily personalized study roadmap and revision schedule in strict JSON format. Include realistic priorities, custom milestones, and a master syllabus mapping.

Strict JSON Output format requirements:
Must return an object containing:
1. "milestones": list of major milestones, e.g., ["First pass syllabus complete by Day X", "Revision intensive phase starting Day Y"]
2. "roadmap": array of roadmap study phases. Each phase has:
   - "phaseName": string, e.g. "Phase 1: Concepts Intensive"
   - "duration": string, e.g. "Days 1 to 5"
   - "focus": string, what subjects/areas are in focus
   - "tasks": list of strings detailing specific daily items (e.g. "Create quick formula sheet", "Log 30 mins reading")
3. "priorityRankings": array of priority-ranked subjects/topics based on weightage. Each has:
   - "subject": string
   - "topic": string
   - "priority": "High" | "Medium" | "Low"
   - "weightageEstimate": string
4. "revisedChecklist": list of quick reminders or alerts.

Do not use markdown markings. Return pure JSON output.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["milestones", "roadmap", "priorityRankings", "revisedChecklist"],
          properties: {
            milestones: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            roadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["phaseName", "duration", "focus", "tasks"],
                properties: {
                  phaseName: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            },
            priorityRankings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["subject", "topic", "priority", "weightageEstimate"],
                properties: {
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  weightageEstimate: { type: Type.STRING }
                }
              }
            },
            revisedChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Syllabus planner failed:", error);
    res.status(500).json({ error: error?.message || "Could not design planner roadmap." });
  }
});

// 6. Homework Camera Scanner & OCR Solver route
// Takes an uploaded base64 image representation and extracts/solves questions step-by-step
app.post("/api/scan-homework", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "No image received. Please upload or scan a question." });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const activeMime = mimeType || "image/png";

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: activeMime,
      },
    };

    const textPart = {
      text: `You are an elite, multi-modal AI Tutor and Homework Solver. Analyze this student's uploaded handwritten, scanned, or screenshot academic homework question.\n\nSteps:\n1. **Text Extraction**: Read and rewrite the exact question/problem in clear text notation.\n2. **Academic Categorization**: State which subject, grade, and topic this references.\n3. **Conceptual Grounding**: Briefly state the key formula or concept needed to solve this.\n4. **Step-by-Step Solver**: Solve the question with absolute scientific and logical precision. Break down the steps so it represents perfect learning progress.\n5. **Final Answer Summary**: Clearly declare the final numerical/analytical answer.\n\nFormat the output beautifully with markdown. Use bold highlights, numbered steps, and explicit code notation for calculations.`,
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [imagePart, textPart]
      },
    });

    res.json({ analysis: response.text || "Could not parse or compile explanation." });
  } catch (error: any) {
    console.error("Camera solver failed:", error);
    res.status(500).json({ error: error?.message || "Hardware scanning or visual solver processing error." });
  }
});

// 7. AI Real-time Exam Generator
app.post("/api/generate-exam", async (req, res) => {
  try {
    const { subjects, durationMinutes, mimicExamStyle, difficulty } = req.body;

    const targetSubjects = subjects && subjects.length > 0 ? subjects : ["General Academic Science"];
    const targetMinutes = durationMinutes || 15;
    const style = mimicExamStyle || "Standard College Placement";
    const level = difficulty || "Standard";

    const prompt = `You are an elite, international examination chief registrar who designs board-certified exam testing copies.
Create a real scholastic exam simulation test based on the actual curriculum guidelines of: "${style}".
Target Subjects to test: ${JSON.stringify(targetSubjects)}.
Exam Duration Allowed: ${targetMinutes} minutes.
Difficulty standard parameter requested: ${level}.

Provide exactly 4 high-fidelity exam questions matching the style:
- Question 1: Multiple Choice Question (MCQ) - highly conceptual (10 points)
- Question 2: Multiple Choice Question (MCQ) - challenging (10 points)
- Question 3: Short Answer Question - requires definition or formula (15 points)
- Question 4: Free Response Long Answer Question - requires comprehensive logic/proof steps (25 points)

Questions must strictly match the character, rigor, and curriculum guidelines of the selected style: "${style}".
Specifically:
- If "${style}" starts with/is "IIT JEE", construct advanced mathematical calculus, electromagnetism, wave optics, or complex algebra.
- If "${style}" starts with/is "NEET", generate highly realistic high-yield botany/zoology cellular biology, organic reaction mechanisms, or thermodynamics.
- If "${style}" is "UPSC CSE", generate profound questions concerning national policy structures, geopolitical frameworks, constitutional law, environmental governance, and systemic socio-economic logic.
- If "${style}" is "CA Exam", evaluate ICAI master-class financial auditing rules, advanced corporate taxation scenarios, or commercial law procedures.
- If "${style}" is "GATE", construct IISc/IIT post-grad level engineering computation, complex dynamic thermodynamics, or informatics algorithms.
- If "${style}" is "CAT", generate rapid quantitative math, tricky data sufficiency arrays, and speed verbal reasoning.
- If "${style}" is "UGC NET", create JRF-level educational philosophies, teaching mechanics, or interdisciplinary logical research ethics.
- If "${style}" is "CLAT", evaluate comprehension cases, Supreme Court landmark torts, or constitutional claim disputes.
- If "${style}" is "NDA Exam", write advanced trigonometry, calculus vectors, and spatial reasoning problems.
- If "${style}" is "UPSC ESE", design massive civil/mechanical engineering stress-strain tensors or electrical network theorems.
- If "${style}" is "SAT", generate rapid-fire graphs, logic-based reasoning, or core high school algebra.
- If "${style}" starts with/is "AP", generate multi-point calculus derivations or fundamental physics proofs.
- If "${style}" is "California Bar", formulate tough professional legal ethics scenarios, constitutional law briefs, tort liability applications, or contract disputes.
- If "${style}" starts with/is "MCAT", formulate biochemical equilibrium, cellular hemodynamics, or organic properties with rich textual background.
- If "${style}" is "USMLE", write rigorous clinical diagnostics, cell pathophysiology scenarios, patient symptoms, molecular pharmacology, or medical biochemistry.
- If "${style}" is "CCIE Lab", generate deep enterprise routing topology challenges, BGP/OSPF protocol switches, or complex active packet filters.
- If "${style}" is "Actuarial Exams" or "${style}" is "DAV Aktuar" or "${style}" is "IFoA Fellowship", formulate survival dynamic functions, multivariable Poisson hazard distributions, or compound premium reserves.
- If "${style}" is "GMAT Exam", write adaptive quantitative logic questions, speed numeric sufficiency tasks, and verbal reasoning traps.
- If "${style}" is "UKMLA", test clinical competencies, safe GMC medicine, pharmacotherapeutics, and healthcare law.
- If "${style}" is "MRCP" or "${style}" is "Physikum Arzt" or "${style}" is "Ishi Kokka Shiken", evaluate specialized clinical pathophysiology, complex diagnostic symptom differential tables, and diagnostic biochemistry.
- If "${style}" is "SQE2", assess UK solicitation cases, advocacy ethics, client interview simulation protocols, or contract disputes.
- If "${style}" is "LNAT", design critical reasoning scenarios, logical argument gaps, or comprehension analyses of complex prose.
- If "${style}" is "CTA UK" or "${style}" is "Steuerberater", test advanced corporate capital gains taxes, inheritance asset laws, or double-taxation relief codes.
- If "${style}" is "Shiho Shiken" or "${style}" is "Staatsexamen Law", construct rigorous civil law briefs, penal code assessments, and constitutional supreme court claims.
- If "${style}" is "CPA Japan" or "${style}" is "Wirtschaftspruefung", write master-tier corporate audits, commercial code ethics, or accounting balance sheet tests.
- If "${style}" is "Sharoshi", target Japan labor laws, social dynamic pensions, and labor insurance clauses.
- If "${style}" is "Benrishi" or "${style}" is "Patentanwalt", target IP patents, trademarks, technical copyright claims, and utility models.
- If "${style}" is "Todai Entrance" or "${style}" is "Kyoto Entrance", design legendary theoretical secondary papers with creative abstract limits, organic compounds, and mechanics.
- If "${style}" is "Singapore A Levels", test Cambridge-Singapore H2/H3 level calculus induction, complex chemical kinetics, or optical physics wave equations.
- If "${style}" is "Singapore Bar", test SILE commercial litigation, Supreme Court advocacy codes, or professional responsibility.
- If "${style}" is "GAMSAT", write 5.5-hour ACER style physical science, organic compounds, or critical writing arguments.
- If "${style}" is "ANZCA Fellowship" or "${style}" is "FRANZCR", formulate medical anesthesia hemodynamics, ICU mechanical triage, or radiography visual anomalies.
- If "${style}" is "AMC Clinical", generate OSCE simulation scenarios, clinical diagnostic logic, and doctor-patient communication boundaries.
- If "${style}" is "CAs ANZ", formulate Australian capstone advisory, auditing risks, and tax assets.
- If "${style}" is "RACS Surgical", test surgical anatomy lines, vascular paths, and pathology.
- If "${style}" is "Schulich Leader Scholarship", build premium STEM-focused algorithmic thinking, mechanical physics, or advanced integral calculus.
- If "${style}" is "ATAR (Australian Admissions)", generate rigorous chemistry curve evaluation, genetics pathways, or multi-dimensional vector dynamics.
- If "${style}" is "ENEM", formulate real-world environmental applications, physics kinemative relations, or applied mathematics.
- If "${style}" is "CPGE", formulate advanced topological sequences, linear algebra vector transformations, or advanced electrodynamics.
- If "${style}" is "International Baccalaureate (IB)", generate highly structured international level content covering physical mechanics, cellular genetics, compound bonding, or complex calculus limits.
- If "${style}" is "Mensa IQ", design rigorous non-verbal abstract logic, spatial reasoning, multi-dimensional matrix patterns, and sequence analysis.
- If "${style}" is "CFA Exam", construct advanced quantitative corporate finance questions, macroeconomic index impacts, asset portfolio risk valuations, and financial ethics parameters.
- If "${style}" is "Master Sommelier", design advanced oenology science, chemistry-based grape viticulture, blind vintage identifiers, and prestigious client service codes.
- If "${style}" is "GRE Test", generate elite post-graduate quantitative reasoning, probability distributions, coordinate set theory, or complex verbal logical deductions.

In addition, customize the generated questions to target the requested subject(s) inside targetSubjects:
- "Astronomy & Astrophysics": focus on stellar mechanics, orbital transfer formulas, black hole thermodynamics, or redshift calculations.
- "Linguistics & Comparative Grammar": focus on morphosemantics, phonetic transcription rules, syntactic tree diagrams, or advanced comparative morphology.
- "Civil & Mechanical Engineering": focus on stress-strain tensors, hydraulic beam deflections, fluid kinematics, or thermal engine cycles.
- "Aerospace & Defence Dynamics": focus on aerodynamics drag models, rocket propulsion ISP thrust equations, missile radar tracking, or projectile ballistics.
- "Corporate Taxation & Auditing": focus on corporate depreciation allowances, asset audit risks, double-taxation relief rules, or capital gains schedules.
- "Biochemistry & Molecular Genetics": focus on enzyme Michaelis-Menten kinetics, transcription factor DNA binding, Sanger sequencing logic, or metabolic Krebs cycle regulations.
- "Global History & Geopolitics": focus on geopolitical power balance shifts, regional maritime trade pacts, historic post-war treaties, or national constitutional crises.
- "Macroeconomics & Monetary Policy": focus on central bank interest rate transmissions, IS-LM balance curves, structural inflation modeling, or balance of payments dynamics.
- "Legal Advocacy & Practice Procedures": focus on appellate courtroom advocacy rules, professional conflict ethics, civil procedure discovery scopes, or cross-examination tactics.
- "Actuarial Risk & Stochastic Mathematics": focus on Brownian motion models, survival probability integration tables, compound Poisson surplus steps, or life annuity contingencies.

Strict JSON Output format requirements:
Must return an object containing keys:
1. "examName": string. Official beautiful exam title, e.g. "IIT JEE Advanced Mini Mock Exam: Magnetism and Quantum Systems"
2. "durationMinutes": number. Matching requested duration of ${targetMinutes}.
3. "conditions": string. Crucial candidate exam hall regulations, e.g., "Read instructions carefully, show structured derivations for free-response, calculators prohibited."
4. "questions": array of exam question objects containing:
   - "id": string (e.g. "eq_1", "eq_3")
   - "question": string (academic test prompt)
   - "type": "mcq", "short", or "long"
   - "options": list of 4 choices (choices MUST be populated if type is "mcq", otherwise empty array or omit)
   - "correctAnswer": string (ideal choice or model grading answer outline)
   - "explain": string (rigorous explanatory model key for our automatic grader)
   - "points": number (points for the question)

Return pure JSON output with no markdown characters.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["examName", "durationMinutes", "conditions", "questions"],
          properties: {
            examName: { type: Type.STRING },
            durationMinutes: { type: Type.INTEGER },
            conditions: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              description: "The official academic simulated exam questions",
              items: {
                type: Type.OBJECT,
                required: ["id", "question", "type", "correctAnswer", "explain", "points"],
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["mcq", "short", "long"] },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  explain: { type: Type.STRING },
                  points: { type: Type.INTEGER }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Exam generation failed:", error);
    res.status(500).json({ error: error?.message || "Failed to generate timed exam simulation." });
  }
});

// 8. AI Real-time Exam Evaluation & Grading System
app.post("/api/evaluate-exam", async (req, res) => {
  try {
    const { examName, mimicExamStyle, questions, userAnswers } = req.body;

    if (!questions || !userAnswers) {
      return res.status(400).json({ error: "Exam context is required to execute grading script." });
    }

    const gradingPayload = {
      examName,
      mimicExamStyle,
      questions,
      studentSubmissions: userAnswers
    };

    const prompt = `You are an elite, certified examiner and senior professor grading boards for academic certification.
Critique and grade the student's handwritten or typed free-text answers submitted for the simulated exam detailed below.

Input Grading Dossier:
${JSON.stringify(gradingPayload, null, 2)}

Instructions:
1. Be mathematically, scientifically, and logically rigorous. Match their response to the "correctAnswer" values.
2. For multiple choice, score fully (match exact string choice options) or 0.
3. For short answers, grade partial credits (up to maxPoints) depending on correct terms and definitions.
4. For long-form answers, grade out of maxPoints depending on logical correctness, intermediate equations, comprehensive coverage, and mathematical structure.
5. Provide helpful, precise guidance pinpointing exact typos or misconceptions.
6. Calculate a visual "grade" matching the standard of the selected style:
   - For IIT JEE: Percentile style (e.g. "98.5th Percentile")
   - For SAT: Scaled score (e.g. "720 / 800")
   - For AP Exam: Integral grade (e.g. "Score: 5 - Extremely Well Qualified")
   - For GCSE / Other: Standard letter (e.g. "A*", "A", "B", etc.)

Strict JSON Output format requirements:
Must return an object containing keys:
1. "score": number (total sum of pointsAwarded)
2. "totalPoints": number (total sum of maxPoints)
3. "grade": string (representing the graded credential)
4. "summaryFeedback": string (overall high-level master review on performance and candidates mindset)
5. "evaluations": array of question evaluations matching the input questions:
   - "questionId": string (matches the question's original id)
   - "studentAnswer": string (what the student wrote, or "No Answer" if empty)
   - "correct": boolean (true if completely correct, false if partially/fully wrong)
   - "pointsAwarded": number (awarded points, cannot exceed maxPoints)
   - "maxPoints": number (max points achievable)
   - "feedback": string (highly detailed pinpoint critique, highlighting exact errors and reviewing concepts)
6. "weakTopics": string list of curriculum areas/topics requiring immediate study
7. "improvementSuggestions": string list of custom review actions

Return pure JSON output with no markdown characters.`;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "totalPoints", "grade", "summaryFeedback", "evaluations", "weakTopics", "improvementSuggestions"],
          properties: {
            score: { type: Type.INTEGER },
            totalPoints: { type: Type.INTEGER },
            grade: { type: Type.STRING },
            summaryFeedback: { type: Type.STRING },
            evaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["questionId", "studentAnswer", "correct", "pointsAwarded", "maxPoints", "feedback"],
                properties: {
                  questionId: { type: Type.STRING },
                  studentAnswer: { type: Type.STRING },
                  correct: { type: Type.BOOLEAN },
                  pointsAwarded: { type: Type.INTEGER },
                  maxPoints: { type: Type.INTEGER },
                  feedback: { type: Type.STRING }
                }
              }
            },
            weakTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            improvementSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Exam evaluation failed:", error);
    res.status(500).json({ error: error?.message || "Failed to grade exam simulation." });
  }
});

// Initialize Express + Vite Setup depending on development vs production
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Copilot Engine Server] Running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

main().catch((err) => {
  console.error("Critical: Failed to boot express server", err);
});
