const geminiService = require("./src/services/gemini.service");

async function testSpeakerQuery() {
  console.log("Testing speaker query...\n");

  const testMessages = [
    "Who are the speakers at the Pan African AI Summit?",
    "Tell me about Darlington Akogo",
    "Who is Hon. Sam George?",
  ];

  for (const message of testMessages) {
    console.log(`\n${"=".repeat(50)}`);
    console.log(`Question: ${message}`);
    console.log("=".repeat(50));

    const response = await geminiService.generateResponse(message, []);

    if (response.success) {
      console.log("Response:", response.message);
      console.log("Model:", response.model);
    } else {
      console.log("Error:", response.error);
    }

    console.log("\n");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait between requests
  }
}

testSpeakerQuery();
