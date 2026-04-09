import { GoogleGenerativeAI } from '@google/generative-ai';

const key = "AIzaSyCj2GX6H5Auwc00S6ierJazoaZQBJ5fv1k";
const genAI = new GoogleGenerativeAI(key);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello");
    console.log(`Model ${modelName} works:`, result.response.text());
  } catch (e) {
    console.error(`Model ${modelName} failed:`, e.message);
  }
}

async function run() {
  await testModel("gemini-1.5-flash-latest");
  await testModel("gemini-pro");
  await testModel("gemini-1.0-pro");
  await testModel("gemini-2.0-flash");
}
run();
