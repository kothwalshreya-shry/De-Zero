import { getAIResponse } from "./services/aiService";
import { signup, login } from "./services/authService";
import { prisma } from "./lib/prisma";
import {authenticateToken,AuthRequest,} from "./middleware/authMiddleware";
import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
const app = express();
app.use(cors());
const PORT = 3000;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      const progress = await prisma.progress.findMany({
        where: {
          userId: req.user!.userId,
        },
        orderBy: {
          date: "asc",
        },
      });

      res.json({
        progress,
      });
    } catch (error) {
      console.error("Progress fetch error:", error);

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
app.listen(PORT, () => {
  console.log(`De Zero backend running on http://localhost:${PORT}`);
});