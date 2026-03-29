"use client";

import { useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { usePartySocket } from "@/hooks/usePartySocket";
import { NeonButton } from "@/components/NeonButton/NeonButton";
import { PublicGameRoom } from "@/types/game";
import styles from "./page.module.css";

function LobbyPageInner() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = params.code.toUpperCase();
  const nickname = searchParams.get("name") || "Player";
  const isHost = searchParams.get("host") === "1";
  const joined = useRef(false);

  const { gameState, error, connected, send } = usePartySocket(code, (room: PublicGameRoom) => {
    if (room.phase === "question" || room.phase === "countdown") {
      const playerId = Object.keys(room.players).find(
        (id) => room.players[id].nickname === nickname
      );
      router.push("/game/" + code + "?name=" + encodeURIComponent(nickname) + (isHost ? "&host=1" : "") + (playerId ? "&pid=" + playerId : ""));
    }
  });

  useEffect(() => {
    if (connected && !joined.current) {
      joined.current = true;
      send({ type: "join", nickname });
    }
  }, [connected, nickname, send]);

  function copyCode() {
    navigator.clipboard.writeText(code).catch(() => {});
  }

  const players = gameState ? Object.values(gameState.players) : [];

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1>Waiting Room</h1>
        <div className={styles.codeBox} onClick={copyCode} title="Click to copy">
          <span className={styles.codeLabel}>Room Code</span>
          <span className={styles.code}>{code}</span>
          <span className={styles.copyHint}>&#x1F4CB; Copy</span>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {!connected && <p className={styles.connecting}>Connecting...</p>}

      <div className={styles.playerList}>
        <h2 className={styles.playersTitle}>Players ({players.length}/8)</h2>
        <ul className={styles.players}>
          {players.map((p) => (
            <li key={p.id} className={styles.playerRow}>
              <span className={styles.playerName}>{p.nickname}</span>
              {p.isHost && <span className={styles.hostBadge}>HOST</span>}
            </li>
          ))}
        </ul>
        {players.length === 0 && connected && (
          <p className={styles.waiting}>Joining room...</p>
        )}
      </div>

      {isHost && (
        <div className={styles.actions}>
          <NeonButton
            variant="pink"
            fullWidth
            disabled={players.length < 1 || !connected}
            onClick={() => send({ type: "start" })}
          >
            Start Game {players.length > 1 ? "(" + players.length + " players)" : ""}
          </NeonButton>
          <p className={styles.hint}>Share the room code with friends to play together</p>
        </div>
      )}
      {!isHost && (
        <p className={styles.hint}>Waiting for the host to start the game...</p>
      )}

      <NeonButton variant="ghost" onClick={() => router.push("/")}>Leave Room</NeonButton>
    </main>
  );
}


export default function LobbyPage() {
  return (
    <Suspense fallback={<div style={{display:"flex",minHeight:"100vh",alignItems:"center",justifyContent:"center",color:"var(--text-muted)"}}>Loading...</div>}>
      <LobbyPageInner />
    </Suspense>
  );
}
