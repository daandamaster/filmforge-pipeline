/** Wave reserve then per-plate debit — drop into src/lib/jarvis/reserve.ts */

export type Reserve = {
  waveId: string;
  projectId: string;
  plates: number;
  reserved: number;
  spent: number;
  released: number;
  refunded: number;
};

export const WARN_AT = 0.8;
export const HARD_STOP_AT = 1;

export function quoteWave(plates: number, costPerPlate: number): number {
  return plates * costPerPlate;
}

export function canOpenWave(balance: number, reservedOthers: number, quote: number): boolean {
  return balance - reservedOthers >= quote;
}

export function usageRatio(r: Reserve): number {
  if (!r.reserved) return 0;
  return (r.spent + r.refunded) / r.reserved;
}

export function shouldWarn(r: Reserve): boolean {
  return usageRatio(r) >= WARN_AT && usageRatio(r) < HARD_STOP_AT;
}

export function hardStop(r: Reserve): boolean {
  return r.spent >= r.reserved || usageRatio(r) >= HARD_STOP_AT;
}

export function applyPlateSuccess(r: Reserve, cost: number): Reserve {
  if (hardStop(r)) throw new Error("HANGAR HARD STOP");
  return { ...r, spent: r.spent + cost };
}

export function applyPlateFail(r: Reserve, cost: number): Reserve {
  return {
    ...r,
    refunded: r.refunded + cost,
    released: r.released + Math.max(0, r.reserved - r.spent - r.refunded - cost),
  };
}
