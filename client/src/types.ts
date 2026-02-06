export type BallKind = "normal" | "bad" | "bonus";

export type BonusKind =
  | "doublePoints"
  | "slowTime"
  | "shield"
  | "bomb"
  | "heal";

export type EventType = "SPAWN" | "TAP" | "MISS" | "BONUS_PICK";

export interface TelemetryEvent {
  t: number;
  type: EventType;
  ballId?: string;
  kind?: BallKind | BonusKind;
  hit?: boolean;
}

export interface GameConfig {
  spawnRatePerSec: number;
  badBallChance: number;
  bonusBallChance: number;
  maxLives: number;
  bonusDurations: {
    doublePoints: number;
    slowTime: number;
    shield: number;
  };
  scores: {
    normal: number;
    bombAll: number;
  };
}

export interface LeaderboardItem {
  nickname: string;
  score: number;
  when: number;
}

export interface LeaderboardResponse {
  items: LeaderboardItem[];
}