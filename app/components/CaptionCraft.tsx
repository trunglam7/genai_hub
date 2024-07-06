import React, { useState } from 'react';
import styles from '../styles/captioncraft.module.css';
import {GoogleGenerativeAI } from '@google/generative-ai';
import { Button, CircularProgress } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ChatIcon from '@mui/icons-material/Chat';
import CaptionChat from './CaptionChat';

const googleGenAIAPIKey = process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;

if (!googleGenAIAPIKey) {
    throw new Error("API key is missing or inactive.");
}

const genAI = new GoogleGenerativeAI(googleGenAIAPIKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export default function CaptionCraft() {
    const [buffer, setBuffer] = useState<Buffer | null>(null);
    const [mimeType, setMimeType] = useState<string>('');
    const [caption, setCaption] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [openChat, setOpenChat] = useState<boolean>(false);
    const [imgData, setImgData] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setCaption('');
        if (file) {
            setMimeType(file.type);
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                setBuffer(Buffer.from(arrayBuffer));

                // Display a preview using base64 encoding
                const base64String = Buffer.from(arrayBuffer).toString("base64");
                const mimeType = file.type;
                setImagePreview(`data:${mimeType};base64,${base64String}`);
            };
        }
    };

    const handleCaption = async () => {
        const prompt = "Give a brief description for the image."
        setLoading(true);
        const imageData: any = { 
            inlineData: {
              data: buffer?.toString("base64"),
              mimeType,
            },
        };

        try {
            const generatedContent = await model.generateContent([prompt, imageData]);
            setCaption(generatedContent.response.text());
            setImgData(imageData);
        } catch (err) {
            console.log('Error generating content');
        } finally {
            setLoading(false);
        }
  
        
    }

    return (
        <div className={styles.captioncraft_container}>
            <div className={styles.upload_container}>
                <h3>Upload Image</h3>
                <p>Supported files: png, jpeg, webp, heic, heif</p>
                <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp, image/heic, image/heif"/>
                <Button variant='contained' onClick={handleCaption} sx={{padding: '1rem'}}><UploadIcon sx={{color: 'white'}}/></Button>
            </div>
            {imagePreview && (
                <div className={styles.image_preview}>
                    <img src={imagePreview} alt="Uploaded Preview" style={{ maxWidth: '50%', height: 'auto' }} />
                </div>
            )}
            {loading ? <CircularProgress /> : <pre style={{textAlign: 'center'}}>{caption}</pre>}
            {(buffer && caption) && <div className={styles.options_container}>
                <Button variant='contained' onClick={() => setOpenChat(true)} sx={{padding: '1rem'}}><ChatIcon sx={{color: 'white'}}/></Button>
            </div>}
            {openChat && <CaptionChat openChat={openChat} setOpenChat={setOpenChat} caption={caption} img={imagePreview} imgData={imgData}/>}
        </div>
    );
}
