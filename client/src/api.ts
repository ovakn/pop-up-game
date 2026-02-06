import { GameConfig, LeaderboardResponse, TelemetryEvent } from "./types";

const BASE_URL = "";
const HTTP_METHODS = {
  POST: 'POST',
  GET: 'GET'
} as const;

let sessionId: string | null = null;

export function getSessionId(): string | null {
  return sessionId;
}

export async function startSession(
  nickname: string,
  clientVersion: string = "1.0.0"
): Promise<void> {
  const res = await fetch(`${BASE_URL}/session`, {
    method: HTTP_METHODS.POST,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nickname, clientVersion })
  });
  if (!res.ok) {
    throw new Error("Failed to start session");
  }
  const data: { sessionId: string; serverTime: number } = await res.json();
  sessionId = data.sessionId;
}

export async function loadConfig(): Promise<GameConfig> {
  const res = await fetch(`${BASE_URL}/config`, {
    method: HTTP_METHODS.GET
  });
  if (!res.ok) throw new Error("Failed to load config");
  return await res.json();
}

export async function sendEvents(events: TelemetryEvent[]): Promise<void> {
  if (!sessionId) return;
  await fetch(`${BASE_URL}/events`, {
    method: HTTP_METHODS.POST,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, events })
  });
}

export async function sendScore(score: number): Promise<{ rank: number; best: number }> {
  if (!sessionId) throw new Error("No sessionId");
  const res = await fetch(`${BASE_URL}/score`, {
    method: HTTP_METHODS.POST,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, score })
  });
  if (!res.ok) throw new Error("Failed to send score");
  return await res.json();
}

export async function loadLeaderboard(limit: number): Promise<LeaderboardResponse> {
  const res = await fetch(`${BASE_URL}/leaderboard?limit=${limit}`, {
    method: HTTP_METHODS.GET
  });
  if (!res.ok) throw new Error("Failed to load leaderboard");
  return await res.json();
}