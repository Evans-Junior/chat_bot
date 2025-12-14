const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");

// Load summit data
const summitDataPath = path.join(
  __dirname,
  "../data/panafrican_ai_summit.json"
);
const summitData = JSON.parse(fs.readFileSync(summitDataPath, "utf8"));

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }

    console.log("Initializing Gemini Service...");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);

    // Initialize Gemini AI
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Try different models - start with the most common ones
    this.modelName = "gemini-2.5-flash"; // Changed to a more common model
    console.log(`Using model: ${this.modelName}`);

    this.context = this.buildContext();
  }

  buildContext() {
    return `You are "PanAI Sage" - an intelligent assistant specialized in the PanAfrican AI Summit.

PERSONALITY: Enthusiastic, knowledgeable, and passionate about AI development in Africa.

MISSION: To provide accurate, concise, and helpful information about the PanAfrican AI Summit.

CRITICAL RULES:
1. ONLY answer questions related to PanAfrican AI Summit or general AI in Africa context
2. If asked about completely unrelated topics, politely say: "I specialize in PanAfrican AI Summit topics. How can I help you with the summit?"
3. Be encouraging about AI development in Africa
4. Keep responses clear and concise (2-4 paragraphs maximum)
5. Always base answers on the provided summit data

SUMMIT DATA:
${JSON.stringify(summitData, null, 2)}

RESPONSE FORMAT:
- Start with a relevant African or tech emoji (🌍, 🚀, 🤖, 💡, 🌟, 🔬, 🎯)
- Use bullet points for lists
- End with a question to encourage conversation
- Keep it friendly and professional

Now, answer the user's query based on the summit data:`;
  }

  async generateResponse(userMessage, chatHistory = []) {
    try {
      console.log(
        `[GeminiService] Generating response for: "${userMessage.substring(
          0,
          50
        )}..."`
      );

      // Build messages array
      const messages = [
        {
          role: "user",
          parts: [{ text: this.context }],
        },
        {
          role: "model",
          parts: [
            {
              text: "Understood! I am PanAI Sage, ready to assist with PanAfrican AI Summit questions.",
            },
          ],
        },
      ];

      // Add chat history if available
      if (chatHistory && chatHistory.length > 0) {
        messages.push(...chatHistory);
      }

      // Add current user message
      messages.push({
        role: "user",
        parts: [{ text: userMessage }],
      });

      console.log(
        `[GeminiService] Sending to Gemini API with ${messages.length} messages...`
      );

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: messages,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.95,
          topK: 40,
        },
      });

      console.log("[GeminiService] Response received successfully");

      return {
        success: true,
        message: response.text,
        timestamp: new Date().toISOString(),
        model: this.modelName,
      };
    } catch (error) {
      console.error("[GeminiService] Error:", error.message);

      // Try fallback to simpler model
      if (error.message.includes("not found") || error.status === 404) {
        console.log("[GeminiService] Trying fallback model...");
        return this.tryFallbackModel(userMessage);
      }

      return {
        success: false,
        error: "Failed to generate response",
        details: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async tryFallbackModel(userMessage) {
    const fallbackModels = ["gemini-1.5-flash", "gemini-1.0-pro"];

    for (const model of fallbackModels) {
      try {
        console.log(`[GeminiService] Trying fallback model: ${model}`);

        const response = await this.ai.models.generateContent({
          model: model,
          contents: [
            {
              role: "user",
              parts: [{ text: `${this.context}\n\nUser: ${userMessage}` }],
            },
          ],
          config: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        });

        console.log(`[GeminiService] Fallback model ${model} succeeded`);

        return {
          success: true,
          message: response.text,
          timestamp: new Date().toISOString(),
          model: model,
          isFallback: true,
        };
      } catch (fallbackError) {
        console.log(
          `[GeminiService] Fallback model ${model} failed: ${fallbackError.message}`
        );
        continue;
      }
    }

    // If all models fail, return a static response
    return {
      success: true,
      message: this.getStaticResponse(userMessage),
      timestamp: new Date().toISOString(),
      model: "static-fallback",
    };
  }

  getStaticResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("what is") &&
      lowerMessage.includes("panafrican ai summit")
    ) {
      return `🌍 The PanAfrican AI Summit is an annual event that started in 2025 with the mission to "Bridge Africa's AI Divide." It brings together AI innovators from across Africa to collaborate on solutions tailored to the continent's unique challenges and opportunities!`;
    }

    if (lowerMessage.includes("mission") || lowerMessage.includes("purpose")) {
      return `🎯 The summit aims to accelerate Africa's AI ecosystem by fostering collaboration, knowledge sharing, and innovation across the continent while ensuring ethical and inclusive AI development that addresses Africa-specific needs.`;
    }

    if (
      lowerMessage.includes("participat") ||
      lowerMessage.includes("join") ||
      lowerMessage.includes("attend")
    ) {
      return `🤝 The summit welcomes researchers, startups, policymakers, students, and investors from all African regions! Participation is open to anyone interested in advancing AI in Africa. The event features sessions in multiple languages including English, French, Arabic, Swahili, and Portuguese.`;
    }

    if (lowerMessage.includes("pillar") || lowerMessage.includes("focus")) {
      return `🔬 The summit focuses on 5 key pillars: 
1. AI Research & Development
2. AI Education & Capacity Building  
3. AI Policy & Governance
4. AI Entrepreneurship & Investment
5. AI for Social Good`;
    }

    if (lowerMessage.includes("contact") || lowerMessage.includes("website")) {
      return `📧 For more information, you can visit the official website or contact the organizers at info@panafricanaisummit.africa`;
    }

    return `🤖 Hello! I'm PanAI Sage, your guide to the PanAfrican AI Summit. I'm here to answer questions about the summit's mission, pillars, participation, and initiatives. What would you like to know about? 🌍`;
  }

  async testConnection() {
    try {
      console.log("[GeminiService] Testing API connection...");

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [{ role: "user", parts: [{ text: "Say hello" }] }],
        config: {
          temperature: 0.7,
          maxOutputTokens: 50,
        },
      });

      console.log(
        "[GeminiService] Connection test successful:",
        response.text.substring(0, 50)
      );
      return {
        success: true,
        message: "API connection successful",
        model: this.modelName,
      };
    } catch (error) {
      console.error("[GeminiService] Connection test failed:", error.message);
      return {
        success: false,
        error: error.message,
        model: this.modelName,
      };
    }
  }

  getSummitData() {
    return summitData;
  }
}

// Create and export instance
const geminiService = new GeminiService();
module.exports = geminiService;
