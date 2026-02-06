import * as PIXI from "pixi.js";

export class Background {
  public container: PIXI.Container;
  private stars: PIXI.Graphics[] = [];

  constructor(width: number, height: number) {
    this.container = new PIXI.Container();
    const bg = new PIXI.Graphics();
    const topColor = 0x0b1d39;
    const bottomColor = 0x1a4b7a;
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r =
        ((topColor >> 16) & 0xff) * (1 - t) +
        ((bottomColor >> 16) & 0xff) * t;
      const g =
        ((topColor >> 8) & 0xff) * (1 - t) +
        ((bottomColor >> 8) & 0xff) * t;
      const b =
        (topColor & 0xff) * (1 - t) +
        (bottomColor & 0xff) * t;
      const color = ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
      bg.beginFill(color);
      bg.drawRect(0, (height / steps) * i, width, height / steps + 1);
      bg.endFill();
    }
    this.container.addChild(bg);
    for (let i = 0; i < 80; i++) {
      const star = new PIXI.Graphics();
      const size = Math.random() * 2 + 1;
      star.beginFill(0xffffff, Math.random() * 0.8 + 0.2);
      star.drawCircle(0, 0, size);
      star.endFill();
      star.x = Math.random() * width;
      star.y = Math.random() * height;
      (star as any).speed = Math.random() * 0.3 + 0.1;
      this.stars.push(star);
      this.container.addChild(star);
    }
  }

  public update(dt: number, width: number, height: number) {
    for (const star of this.stars) {
      const speed = (star as any).speed as number;
      star.y += speed * dt;
      if (star.y > height) {
        star.y = -5;
        star.x = Math.random() * width;
      }
    }
  }
}