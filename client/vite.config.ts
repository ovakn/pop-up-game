import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/session": "http://localhost:8080",
      "/config": "http://localhost:8080",
      "/events": "http://localhost:8080",
      "/score": "http://localhost:8080",
      "/leaderboard": "http://localhost:8080"
    }
  }
});