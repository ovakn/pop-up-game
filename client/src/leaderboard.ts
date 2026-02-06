import * as PIXI from "pixi.js";
import { loadLeaderboard } from "./api";

export class LeaderboardOverlay {
  container = new PIXI.Container();

  constructor(app: PIXI.Application, onClose: () => void) {
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.85);
    bg.drawRect(0, 0, app.screen.width, app.screen.height);
    bg.endFill();
    this.container.addChild(bg);
    const panel = new PIXI.Graphics();
    panel.beginFill(0x222222);
    panel.drawRoundedRect(30, 80, 300, 460, 12);
    panel.endFill();
    this.container.addChild(panel);
    const title = new PIXI.Text({
      text: "TOP PLAYERS",
      style: { fill: "white", fontSize: 22 }
    });
    title.anchor.set(0.5);
    title.x = 180;
    title.y = 120;
    this.container.addChild(title);
    const close = new PIXI.Text({
      text: "CLOSE",
      style: { fill: "red", fontSize: 18 }
    });
    close.anchor.set(0.5);
    close.x = 180;
    close.y = 520;
    close.eventMode = "static";
    close.cursor = "pointer";
    close.on("pointertap", onClose);
    this.container.addChild(close);
    loadLeaderboard(10).then(data => {
      data.items.forEach((item, i) => {
        const row = new PIXI.Text({
          text: `${i + 1}. ${item.nickname} — ${item.score}`,
          style: { fill: "white", fontSize: 16 }
        });
        row.x = 60;
        row.y = 170 + i * 28;
        this.container.addChild(row);
      });
    });
    app.stage.addChild(this.container);
  }

  destroy(app: PIXI.Application) {
    app.stage.removeChild(this.container);
  }
}