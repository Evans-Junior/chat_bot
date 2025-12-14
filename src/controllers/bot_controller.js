const geminiService = require("../services/gemini.service");
const { v4: uuidv4 } = require("uuid");

class BotController {
  constructor() {
    this.sessions = new Map();
    this.pendingTasks = new Map();
    this.completedTasks = new Map();
    this.taskTimeout = 30000;

    console.log("[BotController] Initialized");
  }

  // ADD THIS: Original synchronous chat method (in case routes still reference it)
  async chat(req, res) {
    try {
      console.log("[BotController] Synchronous chat request");

      const { message, sessionId = `session_${Date.now()}` } = req.body;

      // Validate input
      if (
        !message ||
        typeof message !== "string" ||
        message.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid request",
          message: "Message is required and must be a non-empty string",
        });
      }

      const session = this.getSession(sessionId);
      session.lastActive = new Date();

      console.log(
        `[BotController] Processing chat - Session: ${sessionId}, Message: "${message.substring(
          0,
          50
        )}..."`
      );

      // Generate response
      const response = await geminiService.generateResponse(
        message,
        session.history
      );

      // Update session history if we got a response
      if (response.success) {
        session.history.push(
          { role: "user", parts: [{ text: message }] },
          { role: "model", parts: [{ text: response.message }] }
        );

        if (session.history.length > 20) {
          session.history = session.history.slice(-20);
        }
      }

      res.json({
        success: response.success,
        sessionId,
        botName: "PanAI Sage",
        response: response.message || "Sorry, I could not generate a response.",
        timestamp: new Date().toISOString(),
        sessionActivity: session.lastActive,
        messageCount: session.history.length / 2,
        modelUsed: response.model || "unknown",
      });
    } catch (error) {
      console.error("[BotController] Chat error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message || "Failed to process your request",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ADD THIS: Submit message (async)
  async submitMessage(req, res) {
    try {
      console.log("[BotController] Submit message request received");

      const { message, sessionId = `session_${Date.now()}` } = req.body;

      // Validate input
      if (
        !message ||
        typeof message !== "string" ||
        message.trim().length === 0
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid request",
          message: "Message is required and must be a non-empty string",
        });
      }

      const session = this.getSession(sessionId);
      session.lastActive = new Date();

      // Generate a unique task ID
      const taskId = uuidv4();

      // Store the task
      this.pendingTasks.set(taskId, {
        id: taskId,
        sessionId,
        message,
        status: "pending",
        submittedAt: new Date(),
        history: [...session.history],
      });

      // Process the task asynchronously
      this.processTask(taskId);

      // Return the task ID immediately
      res.json({
        success: true,
        taskId,
        sessionId,
        status: "processing",
        message: "Your request is being processed",
        timestamp: new Date().toISOString(),
        checkStatusAt: `/api/bot/response/${taskId}`,
      });
    } catch (error) {
      console.error("[BotController] Submit message error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message || "Failed to submit your message",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ADD THIS: Process task
  async processTask(taskId) {
    try {
      const task = this.pendingTasks.get(taskId);
      if (!task) {
        console.log(`[BotController] Task ${taskId} not found`);
        return;
      }

      console.log(`[BotController] Processing task ${taskId}...`);

      task.status = "processing";
      task.startedAt = new Date();
      this.pendingTasks.set(taskId, task);

      const session = this.getSession(task.sessionId);

      const response = await geminiService.generateResponse(
        task.message,
        task.history
      );

      console.log(
        `[BotController] Task ${taskId} response generated, success: ${response.success}`
      );

      if (response.success) {
        session.history.push(
          { role: "user", parts: [{ text: task.message }] },
          { role: "model", parts: [{ text: response.message }] }
        );

        if (session.history.length > 20) {
          session.history = session.history.slice(-20);
        }

        session.lastActive = new Date();
      }

      // Move task to completed
      this.pendingTasks.delete(taskId);

      this.completedTasks.set(taskId, {
        ...task,
        status: "completed",
        completedAt: new Date(),
        response: {
          success: response.success,
          message:
            response.message || "Sorry, I could not generate a response.",
          modelUsed: response.model || "unknown",
          timestamp: new Date().toISOString(),
        },
        processingTime: new Date() - task.startedAt,
      });

      console.log(
        `[BotController] Task ${taskId} completed in ${
          new Date() - task.startedAt
        }ms`
      );
    } catch (error) {
      console.error(
        `[BotController] Task ${taskId} processing error:`,
        error.message
      );

      const task = this.pendingTasks.get(taskId);
      if (task) {
        this.pendingTasks.delete(taskId);

        this.completedTasks.set(taskId, {
          ...task,
          status: "failed",
          completedAt: new Date(),
          error: error.message,
          processingTime: new Date() - task.startedAt,
        });
      }
    }
  }

  // ADD THIS: Get response
  async getResponse(req, res) {
    try {
      const { taskId } = req.params;

      console.log(`[BotController] Get response for task: ${taskId}`);

      // Check if task is completed
      if (this.completedTasks.has(taskId)) {
        const completedTask = this.completedTasks.get(taskId);

        return res.json({
          success: true,
          taskId,
          sessionId: completedTask.sessionId,
          status: completedTask.status,
          response: completedTask.response,
          submittedAt: completedTask.submittedAt,
          completedAt: completedTask.completedAt,
          processingTime: completedTask.processingTime,
        });
      }

      // Check if task is pending/processing
      if (this.pendingTasks.has(taskId)) {
        const pendingTask = this.pendingTasks.get(taskId);

        return res.json({
          success: true,
          taskId,
          sessionId: pendingTask.sessionId,
          status: pendingTask.status,
          message: "Your request is still being processed",
          submittedAt: pendingTask.submittedAt,
          estimatedWait: "10-30 seconds",
        });
      }

      // Task not found
      return res.status(404).json({
        success: false,
        error: "Task not found",
        message: "The task ID does not exist or has expired",
        taskId,
      });
    } catch (error) {
      console.error("[BotController] Get response error:", error.message);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        message: error.message || "Failed to get response",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // ADD THIS: Get session
  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        id: sessionId,
        history: [],
        createdAt: new Date(),
        lastActive: new Date(),
      });
    }
    return this.sessions.get(sessionId);
  }

  // ADD THIS: Get bot info
  getBotInfo(req, res) {
    try {
      console.log("[BotController] Getting bot info");

      const summitData = geminiService.getSummitData();

      res.json({
        botName: "PanAI Sage",
        description: "Your intelligent guide to the PanAfrican AI Summit",
        version: "1.0.0",
        summit: {
          name: summitData.summit.name,
          tagline: summitData.summit.tagline,
          nextSummit: summitData.summit.next_summit,
        },
        endpoints: {
          chat: "POST /api/bot/chat",
          getResponse: "GET /api/bot/response/:taskId",
          info: "GET /api/bot/info",
        },
        stats: {
          activeSessions: this.sessions.size,
          pendingTasks: this.pendingTasks.size,
          completedTasks: this.completedTasks.size,
        },
      });
    } catch (error) {
      console.error("[BotController] Get bot info error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch bot information",
      });
    }
  }

  // ADD THIS: Get active sessions
  getActiveSessions(req, res) {
    try {
      const sessions = Array.from(this.sessions.entries()).map(
        ([id, session]) => ({
          id,
          messageCount: session.history.length / 2,
          createdAt: session.createdAt,
          lastActive: session.lastActive,
          active: new Date() - session.lastActive < 300000,
        })
      );

      res.json({
        totalSessions: this.sessions.size,
        activeSessions: sessions.filter((s) => s.active).length,
        sessions,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch sessions",
      });
    }
  }

  // ADD THIS: Get pending tasks
  getPendingTasks(req, res) {
    try {
      const tasks = Array.from(this.pendingTasks.entries()).map(
        ([id, task]) => ({
          id,
          sessionId: task.sessionId,
          status: task.status,
          submittedAt: task.submittedAt,
          messagePreview: task.message.substring(0, 50) + "...",
        })
      );

      res.json({
        totalPending: this.pendingTasks.size,
        tasks,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch pending tasks",
      });
    }
  }

  // ADD THIS: Clear session
  clearSession(req, res) {
    try {
      const { sessionId } = req.params;

      if (sessionId === "all") {
        const count = this.sessions.size;
        this.sessions.clear();
        return res.json({
          message: `Cleared all ${count} sessions`,
          sessionsCleared: count,
        });
      }

      if (this.sessions.has(sessionId)) {
        this.sessions.delete(sessionId);
        return res.json({
          message: "Session cleared successfully",
          sessionId,
        });
      }

      res.status(404).json({
        error: "Session not found",
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to clear session",
      });
    }
  }
}

// Export instance
module.exports = new BotController();
