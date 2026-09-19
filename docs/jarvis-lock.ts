/** PRODUCT LOCK — drop into FixYourFilm as src/lib/jarvis/lock.ts */

export type ProductSeat = "workshop" | "strike" | "avengers";
export type CreditPack = "spark" | "creator" | "studio" | "cinema";

export const PLAN_SHOT_CAP: Record<ProductSeat, number> = {
  workshop: 20,
  strike: 240,
  avengers: 720,
};

export const LIVE_CONCURRENT: Record<ProductSeat, number> = {
  workshop: 1,
  strike: 16,
  avengers: 128,
};

export const CREDIT_PACKS: Record<CreditPack, { eur: number; credits: number }> = {
  spark: { eur: 39, credits: 500 },
  creator: { eur: 139, credits: 2000 },
  studio: { eur: 379, credits: 6000 },
  cinema: { eur: 1249, credits: 20000 },
};

/** Credits buy fuel. Seats open the hangar. Never conflate. */
export function seatFromEntitlements(input: {
  owner?: boolean;
  strikeSeat?: boolean;
  cinemaSeat?: boolean;
}): ProductSeat {
  if (input.owner || input.cinemaSeat) return "avengers";
  if (input.strikeSeat) return "strike";
  return "workshop";
}

export function canFireHangar(seat: ProductSeat): boolean {
  return seat !== "workshop";
}

export function requiresHumanVeto(seat: ProductSeat): boolean {
  return seat === "avengers";
}

export function authorizeCopy(plates: number, credits: number): string {
  return `AUTHORIZE FAN-OUT · ${plates} PLATES · ${credits} CR`;
}

export const VETO_LINE = "Sir. I will not spend without your veto.";
export const FLOOR_KICKER = "GPP Mk VII · één deur · één plaat";
export const HANGAR_KICKER = "GPP JARVIS · hangar · fan-out · veto";
