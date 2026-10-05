import { getAIResponse } from "./services/aiService";
import { signup, login } from "./services/authService";
import { prisma } from "./lib/prisma";
import {authenticateToken,AuthRequest,} from "./middleware/authMiddleware";
import "dotenv/config";
import express from "express";
import multer from "multer";
import { extractResumeText } from "./resumeService";
import cors from "cors";
// import OpenAI from "openai";
const app = express();
app.use(cors());
const PORT = 3000;
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the De Zero API",
  });
});
app.use(express.json());

app.post(
  "/api/chat",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { message, history, conversationId } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({
          error: "Message is required",
        });
      }

      let currentConversationId = conversationId;

      if (!currentConversationId) {
        const conversation = await prisma.conversation.create({
          data: {
            userId: req.user!.userId,
            title: message.slice(0, 50),
          },
        });

        currentConversationId = conversation.id;
      }

      await prisma.message.create({
        data: {
          role: "user",
          content: message,
          conversationId: currentConversationId,
        },
      });

      const reply = await getAIResponse(message, history);

      await prisma.message.create({
        data: {
          role: "assistant",
          content: reply,
          conversationId: currentConversationId,
        },
      });

      res.json({
        reply,
        conversationId: currentConversationId,
      });
    } catch (error) {
      console.error("Chat error:", error);

      res.status(500).json({
        error: "Something went wrong",
      });
    }
  }
);
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required",
      });
    }

    const result = await signup(name, email, password);

    res.status(201).json(result);
  } catch (error) {
    console.error("Signup error:", error);

    res.status(400).json({
      error: error instanceof Error ? error.message : "Signup failed",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const result = await login(email, password);

    res.json(result);
  } catch (error) {
    console.error("Login error:", error);

    res.status(401).json({
      error: error instanceof Error ? error.message : "Login failed",
    });
  }
});
app.post(
  "/api/onboarding",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const {
        experience,
        interests,
        goal,
        time,
        struggle,
      } = req.body;

      if (
        !experience ||
        !interests ||
        !goal ||
        !time ||
        !struggle
      ) {
        return res.status(400).json({
          error: "All onboarding fields are required",
        });
      }

      const user = await prisma.user.update({
        where: {
          id: req.user!.userId,
        },
        data: {
          currentLevel: experience,
          interests,
          goal,
          weeklyTime: time,
          struggle,
        },
      });

      res.json({
        message: "Onboarding saved successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currentLevel: user.currentLevel,
          interests: user.interests,
          goal: user.goal,
          weeklyTime: user.weeklyTime,
          struggle: user.struggle,
        },
      });
    } catch (error) {
      console.error("Onboarding error:", error);

      res.status(500).json({
        error: "Could not save onboarding data",
      });
    }
  }
);
app.get("/api/me", authenticateToken, (req: AuthRequest, res) => {
  res.json({
    user: req.user,
  });
});
app.get(
  "/api/me/profile",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user!.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          currentLevel: true,
          interests: true,
          goal: true,
          weeklyTime: true,
          struggle: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      res.json({
        user,
      });
    } catch (error) {
      console.error("Profile fetch error:", error);

      res.status(500).json({
        error: "Could not fetch profile",
      });
    }
  }
);
app.put(
  "/api/me/onboarding",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const {
        currentLevel,
        interests,
        goal,
        weeklyTime,
        struggle,
      } = req.body;

      const user = await prisma.user.update({
        where: {
          id: req.user!.userId,
        },
        data: {
          currentLevel,
          interests,
          goal,
          weeklyTime,
          struggle,
        },
        select: {
          id: true,
          name: true,
          email: true,
          currentLevel: true,
          interests: true,
          goal: true,
          weeklyTime: true,
          struggle: true,
        },
      });

      res.json({
        message: "Onboarding data saved successfully",
        user,
      });
    } catch (error) {
      console.error("Onboarding save error:", error);

      res.status(500).json({
        error: "Could not save onboarding data",
      });
    }
  }
);
app.post(
  "/api/progress",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { minutes, completed } = req.body;

      if (
        typeof minutes !== "number" ||
        minutes < 0
      ) {
        return res.status(400).json({
          error: "Valid minutes are required",
        });
      }

      const progress = await prisma.progress.create({
        data: {
          userId: req.user!.userId,
          minutes,
          completed: completed === true,
        },
      });

      res.status(201).json({
        message: "Progress saved successfully",
        progress,
      });
    } catch (error) {
      console.error("Progress save error:", error);

      res.status(500).json({
        error: "Could not save progress",
      });
    }
  }
);
app.get(
  "/api/progress",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const goals = await prisma.dailyGoal.findMany({
        where: {
          userId,
        },
        orderBy: {
          date: "desc",
        },
      });

      const completedGoals = goals.filter(
        (goal) => goal.completed
      ).length;

      const totalXP = completedGoals * 50;

      const level = Math.floor(totalXP / 250) + 1;

      const nextLevelXP = level * 250;

      res.json({
        stats: {
          totalXP,
          level,
          nextLevelXP,
          completedGoals,
          totalGoals: goals.length,
        },
        goals,
      });
    } catch (error) {
      console.error(
        "Progress fetch error:",
        error
      );

      res.status(500).json({
        error: "Could not fetch progress",
      });
    }
  }
);
app.get(
  "/api/conversations",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          userId: req.user!.userId,
        },
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        conversations,
      });
    } catch (error) {
      console.error("Conversation history error:", error);

      res.status(500).json({
        error: "Could not load conversations",
      });
    }
  }
);

app.post(
  "/api/ai/learning-path",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.userId;

      const goals = await prisma.dailyGoal.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 20,
      });

      const completedGoals = goals.filter(
        (goal) => goal.completed
      ).length;

      const totalGoals = goals.length;

      const totalXP = goals
        .filter((goal) => goal.completed)
        .reduce(
          (sum, goal) => sum + (goal.xp || 0),
          0
        );

      const level =
        Math.floor(totalXP / 250) + 1;

      const recentGoals = goals
        .slice(0, 10)
        .map(
          (goal) =>
            `- ${goal.title} | Category: ${
              goal.category || "general"
            } | Completed: ${
              goal.completed
            } | XP: ${goal.xp || 0}`
        )
        .join("\n");

      const prompt = `
You are the personalization engine for De Zéro,
an AI career companion for beginner software developers.

Create a realistic learning path based ONLY on the
student's actual progress and goals provided below.

STUDENT DATA

Recent goals:
${recentGoals || "No goals created yet."}

Progress:
- Completed goals: ${completedGoals}
- Total goals: ${totalGoals}
- Total XP: ${totalXP}
- Current level: ${level}

PERSONALIZATION RULES

1. Look at the student's actual goals and completed work.
2. Continue skills they are already working on.
3. If they have completed very little, recommend fundamentals.
4. If they have completed several goals, gradually increase difficulty.
5. Do not randomly introduce an unrelated technology.
6. Do not assume the student knows a technology unless their goals
   show evidence of it.
7. The current step should represent what they should work on NOW.
8. The next step should naturally follow the current step.
9. The future step should build on the previous two.
10. The milestone must be a practical project that combines the skills
    developed along the path.
11. Use the student's actual interests when choosing projects.
12. Keep the path achievable for a student.
13. Never claim something is completed unless the provided data shows it.
14. If there is not enough information, start with programming fundamentals.
15. Progress for the current step should reflect the student's actual
    completed goals. Do not invent a high percentage.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside the JSON.

Use exactly this structure:

{
  "learningPath": [
    {
      "id": 1,
      "icon": "</>",
      "label": "Current",
      "title": "short personalized current step",
      "description": "one short explanation",
      "status": "current",
      "progress": 0
    },
    {
      "id": 2,
      "icon": "ϟ",
      "label": "Up Next",
      "title": "short personalized next step",
      "description": "one short explanation",
      "status": "next"
    },
    {
      "id": 3,
      "icon": "⚛",
      "label": "After That",
      "title": "short personalized future step",
      "description": "one short explanation",
      "status": "locked"
    },
    {
      "id": 4,
      "icon": "♛",
      "label": "Milestone",
      "title": "short practical project",
      "description": "one short explanation",
      "status": "milestone"
    }
  ]
}

Additional requirements:

- "progress" must be an integer from 0 to 100.
- Keep titles under 8 words.
- Keep descriptions to one sentence.
- Make every step connected to the previous step.
- Make the milestone project practical and portfolio-friendly.
`;

      const aiText = await getAIResponse(prompt);

      const cleaned = aiText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      if (
        !parsed.learningPath ||
        !Array.isArray(parsed.learningPath)
      ) {
        throw new Error(
          "AI returned an invalid learning path"
        );
      }

      res.json({
        learningPath: parsed.learningPath.slice(0, 4),
      });
    } catch (error) {
      console.error(
        "AI learning path error:",
        error
      );

      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Could not generate AI learning path",
      });
    }
  }
);

app.post(
  "/api/ai/interview/question",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { role, difficulty } = req.body;

      if (!role || !difficulty) {
        return res.status(400).json({
          error: "Role and difficulty are required",
        });
      }

      const prompt = `
You are an AI technical interviewer for De Zéro.

Generate ONE interview question for a student preparing for:

Role: ${role}
Difficulty: ${difficulty}

Rules:
- Make the question realistic.
- Match the selected difficulty.
- Focus on practical software-development knowledge.
- Do not give the answer.
- Do not give hints.
- Keep the question concise.

Return ONLY valid JSON in this exact format:

{
  "question": "your interview question"
}
`;

      const aiText = await getAIResponse(prompt);

      const cleaned = aiText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      res.json(parsed);
    } catch (error) {
      console.error(
        "AI interview question error:",
        error
      );

      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Could not generate interview question",
      });
    }
  }
);

app.get(
  "/api/goals",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const goals = await prisma.dailyGoal.findMany({
        where: {
          userId: req.user!.userId,
        },
        orderBy: {
          date: "desc",
        },
      });

      res.json({ goals });
    } catch (error) {
      console.error("Goals fetch error:", error);

      res.status(500).json({
        error: "Could not fetch goals",
      });
    }
  }
);

app.post(
  "/api/goals",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const {
  title,
  description,
  category,
  xp,
  milestone,
} = req.body;
      if (!title) {
        return res.status(400).json({
          error: "Goal title is required",
        });
      }

      const goal = await prisma.dailyGoal.create({
        data: {
          userId: req.user!.userId,
          title,
          description: description || null,
  category: category || null,
          milestone: milestone || 3,
          xp: xp || 50,
        },
      });

      res.status(201).json({ goal });
    } catch (error) {
      console.error("Goal creation error:", error);

      res.status(500).json({
        error: "Could not create goal",
      });
    }
  }
);
app.post(
  "/api/goals",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { title, description, category, xp } = req.body;

      if (!title) {
        return res.status(400).json({
          error: "Title is required",
        });
      }

      const goal = await prisma.dailyGoal.create({
        data: {
          userId: req.user!.userId,
          title,
          description: description || null,
          category: category || null,
          xp: xp || 50,
        },
      });

      res.status(201).json({ goal });
    } catch (error) {
      console.error("Goal creation error:", error);

      res.status(500).json({
        error: "Could not create goal",
      });
    }
  }
);
app.get(
  "/api/goals",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const goals = await prisma.dailyGoal.findMany({
        where: {
          userId: req.user!.userId,
        },
        orderBy: {
          date: "desc",
        },
      });

      res.json({ goals });
    } catch (error) {
      console.error("Goals fetch error:", error);

      res.status(500).json({
        error: "Could not fetch goals",
      });
    }
  }
);
function parseAIJson(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");

    if (start === -1) {
      throw new Error("AI did not return valid JSON");
    }

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") depth++;
        if (char === "}") depth--;

        if (depth === 0) {
          return JSON.parse(cleaned.slice(start, i + 1));
        }
      }
    }

    throw new Error("AI returned incomplete JSON");
  }
}

app.put(
  "/api/goals/:id/complete",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const goalId = Number(req.params.id);

      const existingGoal = await prisma.dailyGoal.findFirst({
        where: {
          id: goalId,
          userId: req.user!.userId,
        },
      });

      if (!existingGoal) {
        return res.status(404).json({
          error: "Goal not found",
        });
      }

      const completed = !existingGoal.completed;

      const goal = await prisma.dailyGoal.update({
        where: {
          id: goalId,
        },
        data: {
          completed,
          completedAt: completed ? new Date() : null,
        },
      });

      res.json({ goal });
    } catch (error) {
      console.error("Goal completion error:", error);

      res.status(500).json({
        error: "Could not update goal",
      });
    }
  }
);
app.post(
  "/api/ai/interview",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const {
  action,
  question,
  answer,
  history = [],
  mode = "Technical",
  difficulty = "easy",
} = req.body;

// -------------------------
// START INTERVIEW
// -------------------------
if (action === "start") {
  const prompt = `
You are the AI interviewer for De Zéro.

The candidate selected this interview mode:
MODE: ${mode}

The candidate selected this difficulty:
DIFFICULTY: ${difficulty}

You MUST follow the selected MODE exactly.

MODE RULES:

If MODE is "Technical":
- Ask ONLY technical/software-development questions.
- Questions must test programming, algorithms, data structures, debugging, databases, APIs, OOP, web development, computer science fundamentals, or software engineering.
- NEVER ask about career goals.
- NEVER ask about motivation.
- NEVER ask about teamwork or leadership.
- NEVER ask "tell me about yourself".
- NEVER ask behavioral or HR questions.

If MODE is "Behavioral":
- Ask ONLY behavioral questions.
- Focus on teamwork, problem solving, communication, conflict, leadership, challenges, failures, learning experiences, etc.
- Do NOT ask technical programming questions.

If MODE is "HR":
- Ask ONLY HR/career questions.
- Focus on motivation, career goals, strengths, weaknesses, company fit, expectations, etc.
- Do NOT ask technical programming questions.

If MODE is "Mixed":
- Ask a mixture of technical and behavioral/HR questions.
- Start with an appropriate beginner-friendly question.

DIFFICULTY RULES:

If DIFFICULTY is "easy":
- Beginner-friendly.
- Test basic concepts.
- Avoid advanced terminology unless necessary.

If DIFFICULTY is "medium":
- Require some reasoning and practical understanding.

If DIFFICULTY is "hard":
- Require deeper reasoning, problem solving, or implementation knowledge.

IMPORTANT:
The question MUST match both the selected MODE and DIFFICULTY.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside the JSON.

Return exactly:

{
  "question": "one interview question",
  "topic": "specific topic",
  "difficulty": "${difficulty}"
}

Additional rules:
- Ask exactly ONE question.
- Keep the question clear and concise.
- Do not combine multiple questions.
- Do not mention the interview mode in the question.
- Do not reuse generic career questions when MODE is Technical.
`;

  const aiText = await getAIResponse(prompt);

  const parsed = parseAIJson(aiText);

  return res.json(parsed);
}

      // -------------------------
      // ANSWER + NEXT QUESTION
      // -------------------------
      // -------------------------
// ANSWER + NEXT QUESTION
// -------------------------
if (action === "answer") {
  if (!question || !answer) {
    return res.status(400).json({
      error: "Question and answer are required",
    });
  }

  const prompt = `
  INTERVIEW MODE:
${mode}

DIFFICULTY:
${difficulty}
You are conducting an AI interview for a beginner/student developer.

The selected interview mode is:
${mode}

IMPORTANT:
You must evaluate ONLY the candidate's answer to the CURRENT question.
Do not reuse feedback from previous questions.
Do not assume the candidate gave a correct answer.
Do not generate generic feedback.

CURRENT QUESTION:
${question}

CANDIDATE'S CURRENT ANSWER:
${answer}

PREVIOUS INTERVIEW HISTORY:
${JSON.stringify(history)}

Evaluate the CURRENT ANSWER carefully.

Your evaluation must:
1. Determine whether the answer actually addresses the current question.
2. Identify what the candidate did correctly.
3. Identify the most important mistake or missing concept.
4. Give a score based specifically on this answer.
5. Generate ONE new question based on the candidate's demonstrated level.
6. Do not copy the previous question.
7. Do not copy previous feedback.

Return ONLY valid JSON in exactly this structure:

{
  "feedback": {
    "score": 0,
    "strength": "specific thing the candidate did well",
    "improvement": "specific thing the candidate should improve",
    "explanation": "specific explanation of why the answer received this score"
  },
  "nextQuestion": {
    "question": "one new interview question",
    "topic": "topic",
    "difficulty": "easy"
  }
}

SCORING:
- 0-2 = incorrect or unrelated answer
- 3-4 = major misunderstanding but some relevant attempt
- 5-6 = partially correct
- 7-8 = mostly correct with minor issues
- 9 = very strong answer
- 10 = excellent and complete answer

RULES:
- Score must be an integer from 0 to 10.
- Be fair to beginners.
- Feedback MUST refer to the actual current question and answer.
- Never say "you correctly understood" unless the answer actually demonstrates that.
- Never invent something the candidate said.
- Never reuse the same feedback for different answers.
- The next question must be different from the current question.
- Gradually increase difficulty when performance is strong.
- Keep difficulty the same or decrease it when performance is weak.
- Ask exactly ONE next question.
The next question MUST belong to the selected interview mode: ${mode}.

Do not switch interview modes.

If mode is Behavioral, the next question must be behavioral.
If mode is Technical, the next question must be technical.
If mode is HR, the next question must be HR-focused.
If mode is Mixed, alternate appropriately.
`;

  const aiText = await getAIResponse(prompt);

  const parsed = parseAIJson(aiText);

  return res.json(parsed);
}

      // -------------------------
      // FINISH INTERVIEW
      // -------------------------
      if (action === "finish") {
        const prompt = `
You are an AI interviewer evaluating a beginner/student developer.

Here is the complete interview history:

${JSON.stringify(history)}

Create a final interview evaluation.

Return ONLY valid JSON:

{
  "score": 0,
  "rating": "Beginner",
  "summary": "short overall evaluation",
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "improvements": [
    "improvement 1",
    "improvement 2"
  ],
  "nextSteps": [
    "recommended next step 1",
    "recommended next step 2"
  ]
}

Rules:
- Score must be between 0 and 100.
- Be realistic and constructive.
- Do not claim the candidate is job-ready unless the interview actually supports that.
- Focus on actionable improvement.
`;

        const aiText = await getAIResponse(prompt);

        const parsed = parseAIJson(aiText);

        return res.json(parsed);
      }

      return res.status(400).json({
        error: "Invalid interview action",
      });
    } catch (error) {
      console.error("AI interview error:", error);

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Could not process interview",
      });
    }
  }
);
app.delete(
  "/api/goals/:id",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const goalId = Number(req.params.id);

      const existingGoal = await prisma.dailyGoal.findFirst({
        where: {
          id: goalId,
          userId: req.user!.userId,
        },
      });

      if (!existingGoal) {
        return res.status(404).json({
          error: "Goal not found",
        });
      }

      await prisma.dailyGoal.delete({
        where: {
          id: goalId,
        },
      });

      res.json({
        message: "Goal deleted",
      });
    } catch (error) {
      console.error("Goal deletion error:", error);

      res.status(500).json({
        error: "Could not delete goal",
      });
    }
  }
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.post(
  "/api/ai/resume/analyze",
  authenticateToken,
  upload.single("resume"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: "Please upload a resume.",
        });
      }

      const resumeText =
        await extractResumeText(
          req.file.buffer,
          req.file.mimetype,
          req.file.originalname
        );

      if (!resumeText.trim()) {
        return res.status(400).json({
          error:
            "Could not extract any text from this resume.",
        });
      }

      const prompt = `
You are De Zéro Resume Analyzer.

Analyze the following resume for a beginner/student developer.

RESUME:
----------------
${resumeText}
----------------

Return ONLY valid JSON.

Use EXACTLY this structure:

{
  "score": 0,
  "rating": "GOOD FOUNDATION",
  "ats": {
    "compatibility": 0,
    "keywordMatch": 0,
    "formatting": 0,
    "readability": 0
  },
  "strengths": [
    "specific strength"
  ],
  "improvements": [
    "specific improvement"
  ],
  "recommendations": [
    {
      "title": "recommendation title",
      "description": "specific actionable recommendation"
    }
  ]
}

RULES:

- All scores must be integers from 0 to 100.
- The overall score must reflect the actual resume.
- Do NOT automatically give a high score.
- Be fair to beginner/student developers.
- Evaluate only information actually present in the resume.
- Do not invent projects, skills, experience, education, or achievements.
- ATS compatibility should consider structure, clarity, and machine readability.
- Keyword match should reflect how well the resume communicates relevant technical skills.
- Formatting should consider consistency and organization.
- Readability should consider clarity and ease of scanning.
- Give 3-5 specific strengths.
- Give 3-5 specific improvements.
- Give 3-5 actionable recommendations.
- Recommendations must be useful to a student trying to improve their resume.
- Do not give generic motivational advice.
- Keep explanations concise.
`;

      const aiText = await getAIResponse(prompt);

      const parsed = parseAIJson(aiText);

      return res.json(parsed);
    } catch (error) {
      console.error(
        "Resume analysis error:",
        error
      );

      return res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Could not analyze resume.",
      });
    }
  }
);
app.listen(PORT, () => {
  console.log(`De Zero backend running on http://localhost:${PORT}`);
});