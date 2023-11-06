import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import axios from "axios";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function SSRFailPage(props: any) {
  const [news, setNews] = useState([])

  const getNews = async () => {
    const result = await axios.get("http://localhost:8080/news");
    setNews(result.data)
  }

  useEffect(() => {
    getNews();
  }, [])

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
      }}
    >
      {news.map((item: any) => (
        <div
          style={{
            width: "400px",
            padding: "15px",
          }}
        >
          <p>{item.title}</p>
          <p>{item.author}</p>
          <p>{item.description}</p>
          <img src={item.urlToImage} style={{ width: "100%" }} />
          <p>{item.content}</p>
        </div>
      ))}
    </div>
  );
}
