import React, { useEffect, useRef, useState } from 'react'
import styles from '../styles/chatinterface.module.css'
import { Button, CircularProgress, LinearProgress, TextField } from '@mui/material'
import UploadIcon from '@mui/icons-material/Upload';
import SendIcon from '@mui/icons-material/Send';
import FileDownloadDoneIcon from '@mui/icons-material/FileDownloadDone';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Content } from '@google/generative-ai'

const googleGenAIAPIKey = process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;

if(!googleGenAIAPIKey){
throw new Error("API key is missing or inactive.")
}

const genAI = new GoogleGenerativeAI(googleGenAIAPIKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export default function ChatInterface() {

    const [chatHistory, setChatHistory] = useState<Content[]>([]);
    const [query, setQuery] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingDocument, setLoadingDocument] = useState<boolean>(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [file, setFile] = useState<any>();
    const [fileContent, setFileContent] = useState<string>('');
    const [successLoadDoc, setSuccessLoadDoc] = useState<boolean>(false);

    useEffect(() => {
      if(fileContent){

          const prompt = `
          You are to only answer questions and queries relating to the contents provided.
          Do not answer unrelated questions and queries that has nothing to do with the content provided.
          Use the following content to answer the following question in full detail:
    
          ${fileContent}

          If you don't know the answer, just say you don't know.
          `;
    
          setChatHistory(
            [
              {
                role: "user",
                parts: [{text: prompt}],
              },
              {
                role: "model",
                parts: [{text: "Understood! Please provide your questions or queries."}],
              },
            ]
          )
      }
    }, [fileContent])

    useEffect(() => {
        // Scroll to the bottom whenever chatHistory changes
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleKeyDown = (event : any) => {
      if (event.key === 'Enter') {
        handleSubmitQuery();
      }
    };

    const handleUpload = async () => {
      if (file[0]) {
        const formData = new FormData();
        const blob = new Blob([file[0]], { type: file[0].type });
        formData.append('file', blob);
        setLoadingDocument(true);
        setSuccessLoadDoc(false);
  
        try {
          const response = await fetch('/api/data_retriever', {
            method: 'POST',
            body: formData,
          });
  
          const result = await response.json();
          setFileContent(JSON.stringify(result));
          setSuccessLoadDoc(true);
        } catch (error) {
          console.error('Error uploading file:', error);
        } finally {
          setLoadingDocument(false);
        }
      }
    };

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

    useEffect(() => {
      // Scroll to the bottom of the chat container whenever chatHistory changes
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, [chatHistory]);
        
    return (
        <div className={styles.chatinterface_container}>
            <div className={styles.app_header}>
              <h1>Document Chat</h1>
              <div className={styles.upload_container}>
                <input type='file' onChange={(event) => setFile(event.target.files)}/>
                <Button variant='contained' style={{color: 'white', backgroundColor: successLoadDoc ? '#4caf50' : 'rgb(255, 107, 107)'}} onClick={handleUpload}>
                  {successLoadDoc ? <FileDownloadDoneIcon /> : <UploadIcon />}
                </Button>
                {loadingDocument && <CircularProgress />}
              </div>
            </div>
            <div className={styles.chat_container} ref={chatContainerRef}>
                {chatHistory && chatHistory.slice(2).map((msg, index) => msg.role === 'user' ? 
                    <pre key={index} className={styles.human_message}>{msg.parts[0].text}</pre> :
                    <pre key={index} className={styles.ai_message}>{msg.parts[0].text}</pre>)}
            </div>
            {loading && <LinearProgress sx={{width: '100%', maxWidth: '1200px'}}/>}
            {error && <p>{error}</p>}
            {(query && !fileContent) && <p>Please upload a document.</p>}
            <div className={styles.query_container}>
                <TextField onKeyDown={handleKeyDown} value={query} style={{flex: 1, backgroundColor: 'white'}} variant='outlined' placeholder='Enter your question or query' onChange={(event) => setQuery(event.target.value)}/>
                <Button variant='contained' disabled={fileContent ? false : true} onClick={handleSubmitQuery}><SendIcon style={{color: 'white'}}/></Button>
            </div>
        </div>
    )
}
