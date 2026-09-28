import { getAIResponse } from "./services/aiService";
import { signup, login } from "./services/authService";
import { prisma } from "./lib/prisma";
import {authenticateToken,AuthRequest,} from "./middleware/authMiddleware";
import "dotenv/config";
import express from "express";
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
app.listen(PORT, () => {
  console.log(`De Zero backend running on http://localhost:${PORT}`);
});