import React, { useEffect, useState } from 'react'
import style from '../styles/chatrealm.module.css'
import { Button, CircularProgress } from '@mui/material'
import { Content, GoogleGenerativeAI } from '@google/generative-ai';


const googleGenAIAPIKey = process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;

if(!googleGenAIAPIKey){
throw new Error("API key is missing or inactive.")
}

const genAI = new GoogleGenerativeAI(googleGenAIAPIKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: "You are a game master for an interactive text-based RPG. Your role is to create engaging and immersive scenarios for the player. Each scenario should end with a set of clear choices for the player to select from, typically between 2 to 4 options. Always ensure that the choices are relevant to the scenario and advance the story in interesting and unexpected ways. Respond in a structured JSON format with 'scenario', 'choices', and 'end' fields. 'scenario' must be a string, 'choices' must be an array of strings, and 'end' must be a boolean. Story ends when 'end' is true."
  });

export default function ChatRealmInterface() {

    const [currScenario, setCurrScenario] = useState<any>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [chatHistory, setChatHistory] = useState<Content[]>([]);

    useEffect(() => {

        const run = async () => {
            const prompt = "Start"
            setLoading(true);
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();
            console.log(text)
            const cleanedText = text.replace(/```/g, "").replace('json', "");
            setCurrScenario(JSON.parse(cleanedText));
            setChatHistory(
                [
                    {
                        role: "user",
                        parts: [{text: prompt}],
                      },
                    {
                        role: "model",
                        parts: [{text: JSON.stringify(JSON.parse(cleanedText))}],
                    },
                ]
            )
            setLoading(false);
        }
        run();
    }, [])

    const handleSelectChoice = async (choice: string) => {
        setError('');
        setLoading(true);
    
        try {
            // Start a new chat session
            const chat = model.startChat({
                history: chatHistory,
                generationConfig: {
                    maxOutputTokens: 2048,
                },
            });
    
            // Send user's choice to the chat session
            const result = await chat.sendMessage(choice);
            
            setCurrScenario(JSON.parse(result.response.text()));

            // Prepare updated chat history with user choice and model response
            const updatedChatHistory: Content[] = [
                ...chatHistory,
                {
                    role: "user",
                    parts: [{ text: choice }],
                },
                {
                    role: "model",
                    parts: [{ text: result.response.text()}], // Adjust based on actual structure
                }
            ];
    
            // Update state with the updated chat history
            setChatHistory(updatedChatHistory);
            
        } catch (err) {
            console.log(err)
            setError('There is a server error at the moment. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={style.chatrealm_container}>
            <h1 style={{textAlign: 'center'}}>TextQuest RPG</h1>
            {loading && <CircularProgress />}
            {error && <p>{error}</p>}
            {currScenario && 
                <pre className={style.chat_scenario}>
                    {currScenario.scenario}
                </pre>
            }
            {currScenario && (!currScenario.end ? 
                <div className={style.choice_container}>
                    {currScenario && currScenario.choices.map((choice : string, index : number) => 
                        <Button onClick={() => handleSelectChoice(choice)} key={index} variant='contained' style={{color: 'white', fontWeight: 'bold'}}>{choice}</Button>)}
                </div> :
                <p>The End</p>)
            }
        </div>
    )
}
