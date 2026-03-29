import type * as Party from 'partykit/server';
import {
  GameRoom,
  ClientMessage,
  ServerMessage,
  PublicGameRoom,
  ROUND_DURATION_MS,
  TOTAL_ROUNDS,
} from '../types/game';
import {
  createRoom,
  joinRoom,
  removePlayer,
  startGame,
  beginRound,
  submitAnswer,
  revealRound,
  advanceRound,
  allAnswered,
  toPublicRoom,
} from '../lib/game-engine';
import { fetchQuestions } from '../lib/questions';

export default class QuizRoom implements Party.Server {
  private room: GameRoom | null = null;
  private roundTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(readonly party: Party.Party) {}

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Send current state immediately to the new connection
    if (this.room) {
      this.sendTo(conn, { type: 'state-update', room: toPublicRoom(this.room) });
    }
  }

  async onMessage(message: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message) as ClientMessage;
    } catch {
      return;
    }

    switch (msg.type) {
      case 'join':
        this.handleJoin(sender, msg.nickname);
        break;
      case 'start':
        await this.handleStart(sender.id);
        break;
      case 'answer':
        this.handleAnswer(sender.id, msg.answerIndex);
        break;
    }
  }

  async onClose(conn: Party.Connection) {
    if (!this.room) return;
    this.room = removePlayer(this.room, conn.id);
    // If no players remain, clean up timers so the room can hibernate
    if (Object.keys(this.room.players).length === 0) {
      this.clearRoundTimer();
      return;
    }
    this.broadcast({ type: 'state-update', room: toPublicRoom(this.room) });
  }

  // ─── Message handlers ──────────────────────────────────────────────────────

  private handleJoin(conn: Party.Connection, nickname: string) {
    try {
      if (!this.room) {
        // First joiner creates the room
        this.room = createRoom(this.party.id, conn.id, nickname.trim().slice(0, 20) || 'Player');
      } else {
        this.room = joinRoom(this.room, conn.id, nickname);
      }
      this.broadcast({ type: 'state-update', room: toPublicRoom(this.room) });
    } catch (err: unknown) {
      this.sendTo(conn, { type: 'error', message: (err as Error).message });
    }
  }

  private async handleStart(senderId: string) {
    if (!this.room) return;
    if (this.room.hostId !== senderId) return; // only host can start
    if (this.room.phase !== 'lobby') return;

    try {
      const questions = await fetchQuestions(TOTAL_ROUNDS);
      this.room = startGame(this.room, questions);
      this.broadcast({ type: 'state-update', room: toPublicRoom(this.room) });

      // Short countdown before first question
      await this.delay(3000);
      this.startRound();
    } catch (err: unknown) {
      this.broadcast({ type: 'error', message: 'Failed to load questions. Try again.' });
      console.error(err);
    }
  }

  private handleAnswer(senderId: string, answerIndex: number) {
    if (!this.room || this.room.phase !== 'question') return;
    this.room = submitAnswer(this.room, senderId, answerIndex);
    this.broadcast({ type: 'state-update', room: toPublicRoom(this.room) });

    // If all players answered early, reveal immediately
    if (allAnswered(this.room)) {
      this.clearRoundTimer();
      this.endRound();
    }
  }

  // ─── Round lifecycle ────────────────────────────────────────────────────────

  private startRound() {
    if (!this.room) return;
    this.room = beginRound(this.room);
    this.broadcast({ type: 'state-update', room: toPublicRoom(this.room) });

    // Auto-advance after 10 seconds if not everyone answered
    this.roundTimer = setTimeout(() => {
      this.endRound();
    }, ROUND_DURATION_MS);
  }

  private endRound() {
    if (!this.room) return;
    this.clearRoundTimer();
    this.room = revealRound(this.room);
    this.broadcast({ type: 'state-update', room: toPublicRoom(this.room) });

    // Show results for 3 seconds, then advance
    setTimeout(() => {
      if (!this.room) return;
      this.room = advanceRound(this.room);
      this.broadcast({ type: 'state-update', room: toPublicRoom(this.room) });

      if (this.room.phase === 'countdown') {
        // more rounds remain — begin next round
        this.startRound();
      }
      // if phase === 'final-result', game is over — no more timers
    }, 3000);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private clearRoundTimer() {
    if (this.roundTimer !== null) {
      clearTimeout(this.roundTimer);
      this.roundTimer = null;
    }
  }

  private broadcast(msg: ServerMessage) {
    this.party.broadcast(JSON.stringify(msg));
  }

  private sendTo(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

QuizRoom satisfies Party.Worker;
