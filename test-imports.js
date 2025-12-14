const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

async function testDirect() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY not found");
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  console.log("Testing Gemini API directly...\n");

  // Test 1: Simple hello
  console.log("Test 1: Simple hello");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello, say something unique about Africa's AI potential",
    });
    console.log("Response:", response.text.substring(0, 100) + "...\n");
  } catch (error) {
    console.error("Error:", error.message);
  }

  // Test 2: With context
  console.log("Test 2: With context about PanAfrican AI Summit");
  try {
    const context = `You are PanAI Sage, an assistant for PanAfrican AI Summit. 
        The summit aims to bridge Africa's AI divide. 
        Answer this question: What is the PanAfrican AI Summit?`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-pro",
      contents: context,
    });
    console.log("Response:", response.text.substring(0, 150) + "...\n");
  } catch (error) {
    console.error("Error:", error.message);
  }
}

testDirect();
