import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as readline from 'readline'; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Mini-Claw Agent Initialized (Now with Memory!). Type 'exit' to quit.\n");

// 1. We initialize a "chat session". 
// Under the hood, this creates a data array to store the back-and-forth history.
const chatSession = model.startChat({
    history: [] // Starts empty, but will automatically append messages!
});

async function runChat() {
    rl.question('You: ', async (userInput) => {
        
        if (userInput.toLowerCase() === 'exit') {
            console.log("Shutting down Mini-Claw...");
            rl.close();
            return;
        }

        try {
            // 2. Instead of 'model.generateContent', we use 'chatSession.sendMessage'.
            // This automatically passes the entire history array + your new message to the LLM.
            const result = await chatSession.sendMessage(userInput);
            console.log(`\nMini-Claw: ${result.response.text()}\n`);
        } catch (error) {
            console.error("Error communicating with Gemini:", error);
        }

        // 3. Loop again
        runChat();
    });
}

runChat();