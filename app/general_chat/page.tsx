'use client';

import GeneralChat from "../components/GeneralChat";
import Header from "../components/Header";
import styles from "./page.module.css";
import { ThemeProvider, createTheme } from "@mui/material";


const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(255, 107, 107)', // Customize the primary color here
    },
  },
});

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <Header />
      <main className={styles.main}>
        <GeneralChat />
      </main>
    </ThemeProvider>
  );
}

