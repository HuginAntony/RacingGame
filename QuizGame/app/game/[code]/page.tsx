"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { usePartySocket } from "@/hooks/usePartySocket";
import { useCountdown } from "@/hooks/useCountdown";
import { QuestionCard } from "@/components/QuestionCard/QuestionCard";
import { CountdownRing } from "@/components/CountdownRing/CountdownRing";
import { Scoreboard } from "@/components/Scoreboard/Scoreboard";
import { NeonButton } from "@/components/NeonButton/NeonButton";
import { PublicGameRoom } from "@/types/game";
import styles from "./page.module.css";

function GamePageInner() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = params.code;
  const nickname = searchParams.get("name") || "Player";
  const isHost = searchParams.get("host") === "1";
  const joined = useRef(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const { gameState, error, connected, send } = usePartySocket(code, (room: PublicGameRoom) => {
    if (room.phase === "final-result") {
      router.push("/results/" + code + "?name=" + encodeURIComponent(nickname));
    }
    // Detect own player id by matching nickname
    if (!myId) {
      const found = Object.keys(room.players).find(
        (id) => room.players[id].nickname === nickname
      );
      if (found) setMyId(found);
    }
  });

  const isQuestionPhase = gameState?.phase === "question";
  const secondsLeft = useCountdown(gameState?.roundStartedAt ?? 0, isQuestionPhase);

  useEffect(() => {
    if (connected && !joined.current) {
      joined.current = true;
      send({ type: "join", nickname });
    }
  }, [connected, nickname, send]);

  // Reset selected answer on new question
  useEffect(() => {
    setSelectedAnswer(null);
  }, [gameState?.currentQuestionIndex]);

  function handleAnswer(idx: number) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    send({ type: "answer", answerIndex: idx });
  }

  if (!gameState || gameState.phase === "lobby") {
    return (
      <main className={styles.centerPage}>
        <p className={styles.connecting}>{connected ? "Waiting for game to start..." : "Connecting..."}</p>
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  if (gameState.phase === "countdown") {
    return (
      <main className={styles.centerPage}>
        <div className={styles.countdownBig}>
          <p className={styles.getReady}>Get Ready!</p>
          <div className={styles.countdownNum}>3</div>
        </div>
      </main>
    );
  }

  const q = gameState.currentQuestion;
  if (!q) return null;

  const myPlayer = myId ? gameState.players[myId] : null;
  const answered = myPlayer?.answeredIndex !== null;
  const isReveal = gameState.phase === "round-result";

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.progress}>
          Q {gameState.currentQuestionIndex + 1} / {gameState.totalRounds}
        </div>
        {isQuestionPhase && <CountdownRing secondsLeft={secondsLeft} />}
        {isReveal && <div className={styles.revealLabel}>Round Result</div>}
      </div>

      <div className={styles.main}>
        <QuestionCard
          question={q.question}
          category={q.category}
          answers={q.answers}
          correctIndex={q.correctIndex}
          selectedIndex={selectedAnswer}
          onAnswer={handleAnswer}
          disabled={answered || isReveal || !isQuestionPhase}
        />

        {answered && isQuestionPhase && (
          <p className={styles.waitMsg}>Answer submitted! Waiting for others...</p>
        )}
      </div>

      <div className={styles.sidebar}>
        <Scoreboard players={gameState.players} currentPlayerId={myId ?? undefined} />
      </div>
    </main>
  );
}


export default function GamePage() {
  return (
    <Suspense fallback={<div style={{display:"flex",minHeight:"100vh",alignItems:"center",justifyContent:"center",color:"var(--text-muted)"}}>Loading...</div>}>
      <GamePageInner />
    </Suspense>
  );
}
