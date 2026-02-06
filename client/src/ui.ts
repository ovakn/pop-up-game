import * as PIXI from "pixi.js";

export class UI {
  container: PIXI.Container;
  scoreText: PIXI.Text;
  livesText: PIXI.Text;
  buffText: PIXI.Text;
  shieldText: PIXI.Text;
  startBtn: PIXI.Text;
  leaderboardBtn: PIXI.Text;
  nicknameText: PIXI.Text;

  constructor(stage: PIXI.Container) {
    this.container = new PIXI.Container();
    stage.addChild(this.container);
    this.scoreText = new PIXI.Text({
      text: "Score: 0",
      style: { fill: "white", fontSize: 16 }
    });
    this.livesText = new PIXI.Text({
      text: "Lives: 3",
      style: { fill: "white", fontSize: 16 }
    });
    this.buffText = new PIXI.Text({
      text: "",
      style: { fill: "yellow", fontSize: 14 }
    });
    this.shieldText = new PIXI.Text({
      text: "Shield: 0",
      style: { fill: "lime", fontSize: 16 }
    });
    this.scoreText.x = 10;
    this.scoreText.y = 10;
    this.livesText.x = 10;
    this.livesText.y = 30;
    this.buffText.x = 10;
    this.buffText.y = 70;
    this.shieldText.x = 10;
    this.shieldText.y = 90;
    this.shieldText.visible = false;
    this.container.addChild(this.scoreText, this.livesText, this.buffText, this.shieldText);
    this.startBtn = this.makeButton("START", 260, 10);
    this.leaderboardBtn = this.makeButton("LEADERBOARD", 220, 40);
    this.container.addChild(this.startBtn, this.leaderboardBtn);
    this.nicknameText = new PIXI.Text({
      text: "",
      style: { fill: "white", fontSize: 14 }
    });
    this.nicknameText.x = 10;
    this.nicknameText.y = 50;
    stage.addChild(this.nicknameText);
  }

  private makeButton(label: string, x: number, y: number): PIXI.Text {
    const btn = new PIXI.Text({
      text: label,
      style: { fill: "cyan", fontSize: 14 }
    });
    btn.x = x;
    btn.y = y;
    btn.eventMode = "static";
    btn.cursor = "pointer";
    return btn;
  }

  setStartButtonLabel(label: string) {
    this.startBtn.text = label;
  }

  setScore(score: number) {
    this.scoreText.text = `Score: ${score}`;
  }

  setLives(lives: number) {
    this.livesText.text = `Lives: ${lives}`;
  }

  setBuffText(text: string) {
    this.buffText.text = text;
  }

  setShield(charges: number) {
    if (charges > 0) {
      this.shieldText.text = `Shield: ${charges}`;
      this.shieldText.visible = true;
    } else {
      this.shieldText.visible = false;
    }
  }

  setButtonsEnabled(enabled: boolean) {
    this.startBtn.eventMode = enabled ? "static" : "none";
    this.leaderboardBtn.eventMode = enabled ? "static" : "none";
    this.startBtn.alpha = enabled ? 1 : 0.4;
    this.leaderboardBtn.alpha = enabled ? 1 : 0.4;
  }

  public setNickname(nickname: string) {
    this.nicknameText.text = "Nickname: " + nickname;
  }
}