import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    for await (const model of ai.models.list()) {
      console.log(model.name);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
