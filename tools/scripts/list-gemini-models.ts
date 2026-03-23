import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in environment");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There isn't a direct 'listModels' in the top level of the basic SDK sometimes
    // but we can try to find where it is or just test common names.

    console.log("📡 Testing common model names...");
    const modelsToTest = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-pro",
    ];

    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("test");
        const response = await result.response;
        console.log(`✅ ${modelName}: SUCCESS`);
      } catch (error: any) {
        console.log(`❌ ${modelName}: FAILED (${error.message})`);
      }
    }
  } catch (error) {
    console.error("💥 Error during testing:", error);
  }
}

listModels();
