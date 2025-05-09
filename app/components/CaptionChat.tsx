import { Button, Dialog, LinearProgress, TextField } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { Content, GoogleGenerativeAI } from '@google/generative-ai'
import SendIcon from '@mui/icons-material/Send';
import styles from '../styles/captioncraft.module.css'
import { load } from 'langchain/load';

interface CaptionChatProps{
    openChat: boolean,
    setOpenChat: React.Dispatch<React.SetStateAction<boolean>>,
    caption: string,
    img: any,
    imgData: any
}

const googleGenAIAPIKey = process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;

if (!googleGenAIAPIKey) {
    throw new Error("API key is missing or inactive.");
}

const genAI = new GoogleGenerativeAI(googleGenAIAPIKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export default function CaptionChat({openChat, setOpenChat, caption, img, imgData} : CaptionChatProps) {

    const [chatHistory, setChatHistory] = useState<Content[]>([]);
    const [query, setQuery] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prompt = "Give a brief description for the image."
        setChatHistory(
            [
            {
                role: "user",
                parts: [{text: prompt}, imgData],
            },
            {
                role: "model",
                parts: [{text: caption}],
            },
            ]
        )

      }, [])

      const handleSubmitQuery = async () => {
        setLoading(true);
        const updatedChatHistory: Content[] = [...chatHistory, {
          role: "user",
          parts: [{ text: query }],
        }]
    
        setChatHistory(updatedChatHistory);
        setQuery('');
        setError('');
      
        try{
          const chat = model.startChat({
            history: chatHistory,
            generationConfig: {
              maxOutputTokens: 2048,
            },
          });
    
          const result = await chat.sendMessageStream(query);
    
          let modelResponse = ''; 
          const updatedChatHistory: Content[] = [...chatHistory, {
              role: "user",
              parts: [{ text: query }],
            },{
              role: "model",
              parts: [{ text: "" }]
          }];
    
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            modelResponse += chunkText;
                
            updatedChatHistory[updatedChatHistory.length - 1].parts[0].text = modelResponse;
            
            setChatHistory([...updatedChatHistory]);
          }
        } catch (err) {
          setError('There is a server error at the moment. Please try again later.')
        } finally {
          setLoading(false)
        }
    }

    const handleKeyDown = (event : any) => {
        if (event.key === 'Enter') {
          handleSubmitQuery();
        }
    };

    useEffect(() => {
    // Scroll to the bottom of the chat container whenever chatHistory changes
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    }, [chatHistory]);

    return (
        <Dialog open={openChat} onClose={() => setOpenChat(false)}>
            <div className={styles.caption_chat_container}>
                <img src={img} alt="Uploaded Preview" style={{ maxWidth: '50%', height: 'auto' }} />
                <div className={styles.chat_container} ref={chatContainerRef}>
                    {chatHistory && chatHistory.map((msg, index) => msg.role === 'user' ? 
                        <pre key={index} className={styles.human_message}>{msg.parts[0].text}</pre> :
                        <pre key={index} className={styles.ai_message}>{msg.parts[0].text}</pre>)}
                </div>
                {loading && <LinearProgress sx={{width: '100%'}}/>}
                <div className={styles.query_container}>
                    <TextField onKeyDown={handleKeyDown} value={query} style={{flex: 1, backgroundColor: 'white'}} variant='outlined' placeholder='Enter your question or query' onChange={(event) => setQuery(event.target.value)}/>
                    <Button variant='contained' onClick={handleSubmitQuery}><SendIcon style={{color: 'white'}}/></Button>
                </div>
            </div>
        </Dialog>
    )
}
