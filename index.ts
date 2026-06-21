import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
// 1. Import Node's built-in tool for reading terminal inputs
import * as readline from 'readline'; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

// 2. Configure the interface to listen to your standard terminal input/output
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Mini Agent Initialized. Type 'exit' to quit.\n");

// 3. Create the recursive chat loop
async function chat() {
    // rl.question acts exactly like Python's input()
    rl.question('You: ', async (userInput) => {
        
        // Escape hatch to close the program
        if (userInput.toLowerCase() === 'exit') {
            console.log("Shutting down Mini...");
            rl.close();
            return;
        }

        try {
            // Send the dynamic user input to Gemini
            const result = await model.generateContent(userInput);
            console.log(`\nMini-Agent: ${result.response.text()}\n`);
        } catch (error) {
            console.error("Error communicating with Gemini:", error);
        }

        // 4. Call the function again to restart the loop!
        chat();
    });
}

// Kick off the very first turn of the conversation
chat();