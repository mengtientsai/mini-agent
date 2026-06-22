import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as readline from 'readline'; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// ====================================================================
// COMPONENT 1: THE HANDS (Your Local Code)
// This is standard code. It does not use AI. It just returns data.
// ====================================================================
function checkWeather(location: string) {
    console.log(`\n[SYSTEM: Executing local weather API for ${location}...]`);
    // In a production app, you would fetch() data from OpenWeatherMap here.
    // For our prototype, we will just mock the database response.
    if (location.toLowerCase().includes("taipei")) {
        return { temp: 28, condition: "Humid and raining", unit: "Celsius" };
    }
    return { temp: 22, condition: "Sunny and clear", unit: "Celsius" };
}

// ====================================================================
// COMPONENT 2: THE BLUEPRINT (Telling Gemini about the tool)
// ====================================================================
const weatherTool = {
    functionDeclarations: [
        {
            name: "checkWeather",
            description: "Get the current weather for a specific city or location.",
            parameters: {
                type: "OBJECT", // Tells Gemini to format arguments as a JSON Object
                properties: {
                    location: {
                        type: "STRING",
                        description: "The city name, e.g., Taipei or New York.",
                    },
                },
                required: ["location"],
            },
        },
    ],
};

// We attach the tool to the model when we initialize it!
const model = genAI.getGenerativeModel({ 
    model: "gemini-3.5-flash",
    tools: [weatherTool] 
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log("Mini-Claw Agent Initialized (Now with Tools!). Type 'exit' to quit.\n");

const chatSession = model.startChat({ history: [] });

async function runChat() {
    rl.question('You: ', async (userInput) => {
        if (userInput.toLowerCase() === 'exit') {
            console.log("Shutting down...");
            rl.close();
            return;
        }

        try {
            // Send the user's message to Gemini
            let result = await chatSession.sendMessage(userInput);

            // ====================================================================
            // COMPONENT 3: THE INTERCEPTOR (The ReAct Loop)
            // ====================================================================
            const functionCalls = result.response.functionCalls();

            // Check if Gemini's response was a request to use our tool, rather than text
            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                
                if (call.name === "checkWeather") {
                    // 1. Extract the location Gemini pulled from the user's text
                    // @ts-ignore - bypassing strict type checks for the prototype
                    const locationArgument = call.args.location;
                    
                    // 2. Run our local Typescript function!
                    const apiResponse = checkWeather(locationArgument);

                    // 3. Send the raw machine data back to Gemini so it can read it
                    result = await chatSession.sendMessage([{
                        functionResponse: {
                            name: "checkWeather",
                            response: apiResponse
                        }
                    }]);
                }
            }

            // Finally, print Gemini's synthesized human-readable text
            console.log(`\nMini-Claw: ${result.response.text()}\n`);

        } catch (error) {
            console.error("Error communicating with Gemini:", error);
        }

        runChat();
    });
}

runChat();