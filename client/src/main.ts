import * as PIXI from "pixi.js";
import { Game } from "./game";
import { LeaderboardOverlay } from "./leaderboard";
import { loadConfig, startSession } from "./api";
import { Background } from "./background";
import "./style.css";
import { initAudio } from "./audio";

function askNickname(): Promise<string> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "nickname-overlay";
    const modal = document.createElement("div");
    modal.className = "nickname-modal";
    const title = document.createElement("h2");
    title.innerText = "Enter your nickname";
    const input = document.createElement("input");
    input.placeholder = "Nickname...";
    input.maxLength = 16;
    const button = document.createElement("button");
    button.innerText = "Play";
    modal.appendChild(title);
    modal.appendChild(input);
    modal.appendChild(button);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    input.focus();
    function submit() {
      let nickname = input.value.trim();
      if (nickname.length == 0) {
        nickname = "Player" + Math.ceil((Math.random() * 100000));
        resolve(nickname);
      }
      overlay.remove();
      resolve(nickname);
    }
    button.onclick = submit;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submit();
    });
  });
}

async function main() {
  const app = new PIXI.Application();
  await app.init({
    width: 360,
    height: 640,
    backgroundColor: 0x111111
  });
  const appRoot = document.getElementById("app");
  if (!appRoot) {
    throw new Error("No #app element in index.html");
  }
  appRoot.appendChild(app.canvas);
  function resize() {
    if (isMobile()) {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    } else {
      app.renderer.resize(360, 720);
    }
  }
  resize();
  window.addEventListener("resize", resize);
  const bg = new Background(app.screen.width, app.screen.height);
  app.stage.addChild(bg.container);
  app.ticker.add((ticker) => {
    bg.update(ticker.deltaTime, app.screen.width, app.screen.height);
  });
  let leaderboard: LeaderboardOverlay | null = null;
  const config = await loadConfig();
  const game = new Game(app, config);
  const nickname = await askNickname();
  await startSession(nickname);
  game.setNickname(nickname);
  game.onLeaderboardClick(() => {
    if (leaderboard) return;
    leaderboard = new LeaderboardOverlay(app, () => {
      leaderboard?.destroy(app);
      leaderboard = null;
    });
  });
  initAudio();
}

function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
}

main();