'use client';

import { Player } from '@/types/game';
import styles from './Scoreboard.module.css';

interface ScoreboardProps {
  players: Record<string, Player>;
  currentPlayerId?: string;
}

export function Scoreboard({ players, currentPlayerId }: ScoreboardProps) {
  const sorted = Object.values(players).sort((a, b) => b.score - a.score);

  return (
    <div className={styles.board}>
      <h3 className={styles.title}>Scores</h3>
      <ul className={styles.list}>
        {sorted.map((player, idx) => (
          <li
            key={player.id}
            className={`${styles.row} ${player.id === currentPlayerId ? styles.me : ''}`}
          >
            <span className={styles.rank}>#{idx + 1}</span>
            <span className={styles.name}>{player.nickname}</span>
            <span className={styles.score}>{player.score.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
