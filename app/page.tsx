import Link from "next/link";
import Header from "./components/Header";
import styles from "./page.module.css";
import { Divider } from "@mui/material";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.application_container}>
          <div className={styles.application_card}>
            <Image
              src="/images/imageinteract_img.png"
              width={320}
              height={320}
              quality={100}
              alt="Image Interact Screenshot"
            />
            <div className={styles.app_desc}>
              <Link href="/image_interact">Image Interact</Link>
              <p>
                Image Interact is a versatile application designed to help you engage with your images in innovative ways. Users can upload an image and interact with it through our interactive chat functionality. Powered by advanced large language models (LLM), our app allows you to ask questions or get information about the uploaded images.
              </p>
            </div>
          </div>
          <div className={styles.application_card}>
            <Image
              src="/images/textquest_img.png"
              width={320}
              height={320}
              quality={100}
              alt="TextQuest RPG Screenshot"
            />
            <div className={styles.app_desc}>
              <Link href="/textquest_rpg">TextQuest RPG</Link>
              <p>
                TextQuest RPG is an engaging text-based role-playing game powered by advanced large language models (LLM). Dive into immersive stories where your choices shape the adventure. With each scenario, you decide the path your character takes, leading to a unique and personalized narrative journey.
              </p>
            </div>
          </div>
          <div className={styles.application_card}>
            <Image
              src="/images/documentchat_img.png"
              height={320}
              width={320}
              quality={100}
              alt="Document Chat Screenshot"
            />
            <div className={styles.app_desc}>
              <Link href="/document_chat">Document Chat</Link>
              <p>
                Document Chat is a practical application designed to help you interact with your PDF or CSV files more conveniently. By leveraging advanced large language models (LLM), our app enables you to upload your documents and chat with them to quickly extract information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
