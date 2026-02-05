import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeEvents, spikeMetrics, serveMetrics, receptionMetrics } from "../src/lib/stats";
import type { EventOutcome, EventType } from "@prisma/client";

test("summarizeEvents computes rates", () => {
  const events = [
    { type: "SPIKE" as EventType, outcome: "POINT" as EventOutcome },
    { type: "SPIKE" as EventType, outcome: "ERROR" as EventOutcome },
    { type: "SERVE" as EventType, outcome: "ACE" as EventOutcome },
    { type: "SERVE" as EventType, outcome: "MISS" as EventOutcome },
    { type: "RECEPTION" as EventType, outcome: "SUCCESS_A" as EventOutcome }
  ];

  const summary = summarizeEvents(events);
  const spike = spikeMetrics(summary.spike);
  const serve = serveMetrics(summary.serve);
  const reception = receptionMetrics(summary.reception);

  assert.equal(spike.attempts, 2);
  assert.equal(spike.killRate, 50);
  assert.equal(serve.aceRate, 50);
  assert.equal(reception.successRate, 100);
});
