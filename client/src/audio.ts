import { sound } from "@pixi/sound";

export function initAudio() {
  sound.add("music", "/audio/bg_music.mp3");
  sound.add("tap", "/audio/tap.wav");
  sound.add("bad", "/audio/bad_tap.wav");
  sound.add("bonus", "/audio/bonus_tap.wav");
  sound.add("gameover", "/audio/game_over.wav");
}

export function playMusic() {
  if (!sound.exists("music")) return;
  if (!sound.find("music")?.isPlaying) {
    sound.play("music", {
      loop: true,
      volume: 1.0
    });
  }
}

export function stopMusic() {
  sound.stop("music");
}

export function setMusicVolume(v: number) {
  const instance = sound.find("music");
  if (instance) instance.volume = v;
}

export function playSfx(name: "tap" | "bad" | "bonus" | "gameover") {
  sound.play(name, { volume: 0.7 });
}