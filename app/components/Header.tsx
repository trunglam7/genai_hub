import React from 'react'
import styles from '../styles/header.module.css'
import Link from 'next/link'

export default function Header() {
  return (
    <header className={styles.header}>
        <h1>GenAI Hub</h1>
        <ul>
            <li>
                <Link href="/">Home</Link>
            </li>
        </ul>
    </header>
  )
}
