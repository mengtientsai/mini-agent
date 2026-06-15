import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Initialize the client by explicitly passing your key from the .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function main() {
    console.log("Connecting to Gemini...");

    // 2. Specify the model you want to use (gemini-1.5-flash is excellent for fast agent loops)
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // 3. The Prompt
    const prompt = "Hello! I am a data engineer building my first AI agent. Who are you?";

    // 4. The API Call
    const result = await model.generateContent(prompt);

    console.log("\nGemini's Response:");
    
    // 5. Extract and print the text from the response object
    console.log(result.response.text());
}

// Execute the function
main().catch(console.error);