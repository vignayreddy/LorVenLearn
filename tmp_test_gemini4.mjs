import { GoogleGenerativeAI } from '@google/generative-ai';

const key = "AIzaSyAz8AJk9l8byzsj_eUq40eYmRzunq7sQv8";
const genAI = new GoogleGenerativeAI(key);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello?");
    console.log(`[SUCCESS] ${modelName}:`, result.response.text());
  } catch (e) {
    if (e.message.includes("403")) {
      console.error(`[ERROR 403] ${modelName}: Forbidden API_KEY_BLOCKED`);
    } else {
      console.error(`[ERROR] ${modelName}:`, e.message);
    }
  }
}

async function run() {
  await testModel("gemini-1.5-flash");
}
run();
