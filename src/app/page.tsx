"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import AuthModal from "@/components/AuthModal";
import JsonLd from "@/components/JsonLd";

export default function Home() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Structured data for the game
  const gameStructuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "WordTeam",
    "description": "An exciting word game to challenge your vocabulary. Win points for your team and climb the leaderboard!",
    "genre": "Word Game",
    "gamePlatform": "Web Browser",
    "applicationCategory": "Game",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "100"
    },
    "image": "https://playwordteam.com/word-team-logo.svg",
    "url": "https://playwordteam.com"
  };

  return (
    <div className={styles.container}>
      <JsonLd data={gameStructuredData} />
      <main className={styles.main}>
        <h1 className={styles.title}>WordTeam</h1>
        
        <div className={styles.imageContainer}>
          <Image
            src="/word-team-logo.svg"
            alt="WordTeam Logo"
            width={300}
            height={300}
            priority
            className={styles.logo}
          />
        </div>
        
        <div className={styles.buttonContainer}>
          <button className={styles.playButton} onClick={() => setIsAuthModalOpen(true)}>
            Play Now
          </button>
        </div>
        
        <button className={styles.helpButton} onClick={() => setIsHelpModalOpen(true)}>
          How to Play
        </button>
        
        {isHelpModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsHelpModalOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeButton} onClick={() => setIsHelpModalOpen(false)}>
                ×
              </button>
              <h2>How to Play</h2>
              <div className={styles.modalContent}>
                <p>🎯 Guess the secret word of the day using the theme as your clue.</p>
                <p>🟥🟨🟩 Colors show how close your guess is (based on letter similarity).</p>
                <p>💡 Need help? You&apos;ll get clues after some failed guesses to help you solve the word!</p>
                <p>🔵🔴 You&apos;re automatically on Blue Chill or Red Ember — your correct guesses help your team win!</p>
                <p>⭐ Your points depend on the word length, number of guesses, and time used.</p>
                <p>🧠 One word per day. New theme and new challenge every day!</p>
              </div>
            </div>
          </div>
        )}

        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </main>
    </div>
  );
}
