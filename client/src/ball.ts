import * as PIXI from "pixi.js";
import { BallKind, BonusKind } from "./types";

export class Ball {
  id = crypto.randomUUID();
  gravity = 0.05;
  radius = 25;
  kind: BallKind;
  bonus?: BonusKind;
  vx: number;
  vy: number;
  gfx: PIXI.Graphics;
  private time = 0;
  private curveStrength = 0;
  private curveSpeed = 0;

  constructor(x: number, y: number, kind: BallKind, bonus?: BonusKind) {
    this.kind = kind;
    this.bonus = bonus;
    this.vx = (Math.random() - 0.5) * 1.5;
    const targetHeight = 500 + Math.random() * 120;
    const v0 = Math.sqrt(2 * this.gravity * targetHeight);
    this.vy = -v0;
    this.curveStrength = 0.6 + Math.random() * 0.9; // насколько сильно изгибается
    this.curveSpeed = 0.02 + Math.random() * 0.03;  // скорость "качания"
    this.gfx = new PIXI.Graphics();
    this.draw();
    this.gfx.x = x;
    this.gfx.y = y;
  }

  private draw() {
    this.gfx.clear();
    let color = 0xffffff;
    let text = "";
    let textColor = "white";
    if (this.kind === "normal") {
      color = 0x22ff22;
      text = "";
      textColor = "black";
    }
    if (this.kind === "bad") {
      color = 0xff2222;
      text = "";
      textColor = "black";
    }
    if (this.kind === "bonus") {
      if (this.bonus === "doublePoints") {
        color = 0xffd700;
        text = "x2";
        textColor = "black";
      }
      if (this.bonus === "slowTime") {
        color = 0x00ffff;
        text = "SLOW";
        textColor = "black";
      }
      if (this.bonus === "shield") {
        color = 0x7f00ff;
        text = "SHIELD";
        textColor = "black"
      }
      if (this.bonus === "bomb") {
        color = 0x000000;
        text = "BOMB";
        textColor = "white";
      }
      if (this.bonus === "heal") {
        color = 0xffffff;
        text = "HEAL"
        textColor = "black"
      }
    }
    this.gfx.beginFill(color);
    this.gfx.drawCircle(0, 0, this.radius);
    this.gfx.endFill();
    if (this.kind === "bonus" && this.bonus) {
      const label = new PIXI.Text({
        text: text,
        style: { fill: textColor, fontSize: 10 }
      });
      label.anchor.set(0.5);
      this.gfx.addChild(label);
    }
  }

  update(dt: number, speedFactor: number) {
    this.time += dt;
    this.vy += this.gravity * dt * speedFactor;
    const wave = Math.sin(this.time * this.curveSpeed) * this.curveStrength;
    this.gfx.x += (this.vx + wave) * dt * speedFactor;
    this.gfx.y += this.vy * dt * speedFactor;
  }

  hit(x: number, y: number): boolean {
    const dx = x - this.gfx.x;
    const dy = y - this.gfx.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}