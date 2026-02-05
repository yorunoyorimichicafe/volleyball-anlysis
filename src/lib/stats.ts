import { EventOutcome, EventType } from "@prisma/client";

export type StatBlock = {
  total: number;
  point: number;
  inPlay: number;
  error: number;
  blocked: number;
  ace: number;
  miss: number;
  successA: number;
  successB: number;
  successC: number;
};

export type StatSummary = {
  spike: StatBlock;
  serve: StatBlock;
  reception: StatBlock;
};

const emptyBlock = (): StatBlock => ({
  total: 0,
  point: 0,
  inPlay: 0,
  error: 0,
  blocked: 0,
  ace: 0,
  miss: 0,
  successA: 0,
  successB: 0,
  successC: 0
});

export function summarizeEvents(events: { type: EventType; outcome: EventOutcome }[]): StatSummary {
  const summary: StatSummary = {
    spike: emptyBlock(),
    serve: emptyBlock(),
    reception: emptyBlock()
  };

  for (const event of events) {
    const bucket =
      event.type === "SPIKE"
        ? summary.spike
        : event.type === "SERVE"
          ? summary.serve
          : summary.reception;

    bucket.total += 1;

    switch (event.outcome) {
      case "POINT":
        bucket.point += 1;
        break;
      case "IN_PLAY":
        bucket.inPlay += 1;
        break;
      case "ERROR":
        bucket.error += 1;
        break;
      case "BLOCKED":
        bucket.blocked += 1;
        break;
      case "ACE":
        bucket.ace += 1;
        break;
      case "MISS":
        bucket.miss += 1;
        break;
      case "SUCCESS_A":
        bucket.successA += 1;
        break;
      case "SUCCESS_B":
        bucket.successB += 1;
        break;
      case "SUCCESS_C":
        bucket.successC += 1;
        break;
    }
  }

  return summary;
}

export function rate(numerator: number, denominator: number) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export function spikeMetrics(spike: StatBlock) {
  return {
    attempts: spike.total,
    kills: spike.point,
    killRate: rate(spike.point, spike.total),
    errorRate: rate(spike.error, spike.total),
    blockRate: rate(spike.blocked, spike.total)
  };
}

export function serveMetrics(serve: StatBlock) {
  return {
    attempts: serve.total,
    aces: serve.ace,
    misses: serve.miss,
    aceRate: rate(serve.ace, serve.total),
    missRate: rate(serve.miss, serve.total)
  };
}

export function receptionMetrics(reception: StatBlock) {
  const success = reception.successA + reception.successB + reception.successC;
  return {
    attempts: reception.total,
    success,
    successRate: rate(success, reception.total)
  };
}
