import * as PIXI from "pixi.js";
import { Ball } from "./ball";
import { BonusKind, GameConfig } from "./types";
import { sendScore, startSession } from "./api";
import { Telemetry } from "./telemetry";
import { UI } from "./ui";
import { playMusic, playSfx, setMusicVolume } from "./audio";

export class Game {
  private gameOverContainer: PIXI.Container | null = null;
  private balls: Ball[] = [];
  private resultText: PIXI.Text | null = null;
  private shieldCharges = 0;
  private score = 0;
  private config: GameConfig;
  private lives: number;
  private running = false;
  private spawnTimer = 0;
  private doublePointsUntil = 0;
  private slowTimeUntil = 0;
  private telemetry = new Telemetry(15, 5000);
  private ui: UI;
  private state: "idle" | "running" | "gameover" = "idle";

  constructor(private app: PIXI.Application, private serverConfig: GameConfig) {
    this.config = serverConfig;
    this.lives = this.config.maxLives;
    this.ui = new UI(app.stage);
    this.ui.startBtn.on("pointertap", this.onStartButton);
    this.ui.setStartButtonLabel("START");
    app.stage.eventMode = "static";
    app.stage.on("pointerdown", this.onTap);
    app.ticker.add(this.update);
    this.renderUI();
  }

  public onLeaderboardClick(cb: () => void) {
    this.ui.leaderboardBtn.on("pointertap", cb);
  }

  private onStartButton = () => {
    if (this.state === "idle") {
      this.start();
    } else {
      this.restart();
    }
  };

  public setNickname(nickname: string) {
    this.ui.setNickname(nickname);
  }

  private start = () => {
    this.running = true;
    this.state = "running";
    this.ui.setStartButtonLabel("RESTART");
    playMusic();
    setMusicVolume(0.7);
  };

  private restart = () => {
    this.score = 0;
    this.lives = this.config.maxLives;
    this.running = true;
    this.state = "running";
    this.shieldCharges = 0;
    this.ui.setShield(0);
    this.doublePointsUntil = 0;
    this.slowTimeUntil = 0;
    for (const b of this.balls) {
      this.app.stage.removeChild(b.gfx);
    }
    this.balls = [];
    this.spawnTimer = 0;
    if (this.gameOverContainer) {
      this.app.stage.removeChild(this.gameOverContainer);
      this.gameOverContainer.destroy({ children: true });
      this.gameOverContainer = null;
    }
    this.ui.setStartButtonLabel("RESTART");
    this.renderUI();
  };

  private spawnBall() {
    let kind: "normal" | "bad" | "bonus" = "normal";
    let bonus: BonusKind | undefined;
    const bonusPool: BonusKind[] = ["doublePoints", "slowTime", "shield", "bomb", "heal"];
    const r = Math.random();
    if (r < this.config.badBallChance) {
      kind = "bad";
    } else if (r < this.config.badBallChance + this.config.bonusBallChance) {
      kind = "bonus";
      bonus = bonusPool[Math.floor(Math.random() * bonusPool.length)];
    }
    const ball = new Ball(
      Math.random() * (this.app.screen.width - 40) + 20,
      this.app.screen.height + 20,
      kind,
      bonus
    );
    this.balls.push(ball);
    this.app.stage.addChild(ball.gfx);
    this.telemetry.add({
      t: Date.now(),
      type: "SPAWN",
      ballId: ball.id,
      kind: kind === "bonus" ? bonus : kind
    });
  }

  private onTap = (e: PIXI.FederatedPointerEvent) => {
    if (!this.running) return;
    const p = e.global;
    for (const ball of this.balls) {
      if (ball.hit(p.x, p.y)) {
        if (ball.kind === "normal") {
          const mult = this.isDoublePointsActive() ? 2 : 1;
          this.score += this.config.scores.normal * mult;
          playSfx("tap");
        }
        if (ball.kind === "bad") {
          this.loselife();
          playSfx("bad");
        }
        if (ball.kind === "bonus" && ball.bonus) {
          this.activateBonus(ball.bonus);
          playSfx("bonus");
        }
        this.telemetry.add({
          t: Date.now(),
          type: "TAP",
          ballId: ball.id,
          hit: true
        });
        this.removeBall(ball);
        this.renderUI();
        return;
      }
    }
    this.telemetry.add({
      t: Date.now(),
      type: "TAP",
      hit: false
    });
  };

  private activateBonus(bonus: BonusKind) {
    const now = Date.now();
    if (bonus === "doublePoints") {
      const add = this.config.bonusDurations.doublePoints * 1000;
      if (this.doublePointsUntil > now) {
        this.doublePointsUntil += add;
      } else {
        this.doublePointsUntil = now + add;
      }
    }
    if (bonus === "slowTime") {
      const add = this.config.bonusDurations.slowTime * 1000;
      if (this.slowTimeUntil > now) {
        this.slowTimeUntil += add;
      } else {
        this.slowTimeUntil = now + add;
      }
    }
    if (bonus === "shield") {
      this.shieldCharges++;
      this.ui.setShield(this.shieldCharges);
    }
    if (bonus === "heal") {
      this.lives = Math.min(this.lives + 1, this.config.maxLives);
      this.ui.setLives(this.lives);
    }
    if (bonus === "bomb") {
      for (const ball of [...this.balls]) {
        if (ball.kind === "normal") {
          const mult = this.isDoublePointsActive() ? 2 : 1;
          this.score += this.config.scores.bombAll * mult;
          this.removeBall(ball);
        }
      }
      this.ui.setScore(this.score);
    }
    this.telemetry.add({
      t: now,
      type: "BONUS_PICK",
      kind: bonus
    });
  }

  private isDoublePointsActive(): boolean {
    return Date.now() < this.doublePointsUntil;
  }

  private isSlowTimeActive(): boolean {
    return Date.now() < this.slowTimeUntil;
  }

  private removeBall(ball: Ball) {
    this.app.stage.removeChild(ball.gfx);
    this.balls = this.balls.filter(b => b !== ball);
  }

  private update = (ticker: PIXI.Ticker) => {
    if (!this.running) return;
    const dt = ticker.deltaTime;
    const speedFactor = this.isSlowTimeActive() ? 0.4 : 1.0;
    this.spawnTimer += dt;
    if (this.spawnTimer >= 60 / this.config.spawnRatePerSec) {
      this.spawnTimer = 0;
      this.spawnBall();
    }
    for (const ball of [...this.balls]) {
      ball.update(dt, speedFactor);
      if (ball.gfx.x < 20) {
        ball.gfx.x = 20;
        ball.vx *= -1;
      }
      if (ball.gfx.x > this.app.screen.width - 20) {
        ball.gfx.x = this.app.screen.width - 20;
        ball.vx *= -1;
      }
      if (ball.gfx.y > this.app.screen.height + 30) {
        if (ball.kind === "normal") {
          this.loselife();
          this.telemetry.add({
            t: Date.now(),
            type: "MISS",
            ballId: ball.id
          });
        }
        this.removeBall(ball);
      }
    }
    this.renderUI();
  };

  private loselife() {
    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      this.ui.setShield(this.shieldCharges);
      return;
    }
    this.lives--;
    this.ui.setLives(this.lives);
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private gameOver() {
    this.running = false;
    this.state = "gameover";
    this.ui.setStartButtonLabel("RESTART");
    const c = new PIXI.Container();
    this.gameOverContainer = c;
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.75);
    bg.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.endFill();
    bg.eventMode = "none";
    c.addChild(bg);
    const title = new PIXI.Text("GAME OVER", {
      fill: "white",
      fontSize: 42,
      fontWeight: "bold"
    });
    title.anchor.set(0.5);
    title.x = this.app.screen.width / 2;
    title.y = this.app.screen.height / 2 - 120;
    c.addChild(title);
    const scoreText = new PIXI.Text(`Score: ${this.score}`, {
      fill: "white",
      fontSize: 28
    });
    scoreText.anchor.set(0.5);
    scoreText.x = this.app.screen.width / 2;
    scoreText.y = this.app.screen.height / 2 - 60;
    c.addChild(scoreText);
    this.resultText = new PIXI.Text("Sending score...", {
      fill: "#cccccc",
      fontSize: 18
    });
    this.resultText.anchor.set(0.5);
    this.resultText.x = this.app.screen.width / 2;
    this.resultText.y = this.app.screen.height / 2;
    c.addChild(this.resultText);
    this.app.stage.addChild(c);
    this.app.stage.addChild(this.ui.container);
    playSfx("gameover");
    sendScore(this.score)
      .then((res) => {
        if (this.resultText) {
          this.resultText.text = `Rank: #${res.rank}\nBest: ${res.best}`;
        }
      })
      .catch(() => {
        if (this.resultText) {
          this.resultText.text = "Failed to send score";
        }
      });
  }

  private renderUI() {
    this.ui.setScore(this.score);
    this.ui.setLives(this.lives);
    const now = Date.now();
    const buffs: string[] = [];
    if (now < this.doublePointsUntil) {
      buffs.push(`x2 ${((this.doublePointsUntil - now) / 1000) | 0}s`);
    }
    if (now < this.slowTimeUntil) {
      buffs.push(`SLOW ${((this.slowTimeUntil - now) / 1000) | 0}s`);
    }
    this.ui.setBuffText(buffs.join(" | "));
  }
}