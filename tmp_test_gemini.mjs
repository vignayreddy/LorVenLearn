import { GoogleGenerativeAI } from '@google/generative-ai';

async function testKey(key) {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log(`Key ${key.substring(0, 5)}... works:`, result.response.text());
  } catch (e) {
    console.error(`Key ${key.substring(0, 5)}... failed:`, e.message);
  }
}

testKey("AIzaSyCj2GX6H5Auwc00S6ierJazoaZQBJ5fv1k");
testKey("AIzaSyAz8AJk9l8byzsj_eUq40eYmRzunq7sQv8");
