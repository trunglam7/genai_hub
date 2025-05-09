import React from 'react'
import styles from '../styles/generalchat.module.css'
import { Button, TextField } from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';


export default function GeneralChat() {
  return (
    <div className={styles.chat_container}>
        <div className={styles.content_container}>
            Content
        </div>
        <div className={styles.input_container}>
            <Button variant='contained' ><AttachFileIcon style={{color: 'white'}}/></Button>
            <TextField style={{flex: 1, backgroundColor: 'white'}} variant='outlined' placeholder='Enter your question or query'/>
            <Button variant='contained' ><SendIcon style={{color: 'white'}}/></Button>
        </div>
    </div>
  )
}
