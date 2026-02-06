import { TelemetryEvent } from "./types";
import { sendEvents } from "./api";

export class Telemetry {
  private buffer: TelemetryEvent[] = [];
  private lastFlush = Date.now();

  constructor(private maxEvents: number, private maxMs: number) { }

  add(ev: TelemetryEvent) {
    this.buffer.push(ev);
    const now = Date.now();
    if (this.buffer.length >= this.maxEvents || now - this.lastFlush >= this.maxMs) {
      this.flush();
    }
  }

  async flush() {
    if (this.buffer.length === 0) return;
    const batch = this.buffer;
    this.buffer = [];
    this.lastFlush = Date.now();
    await sendEvents(batch);
  }
}