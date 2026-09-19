/** CHAIN / CUT wave planner — drop into src/lib/jarvis/fanout.ts */

export type LinkKind = "CHAIN" | "CUT";
export type BayState = "STANDBY" | "ROLLING" | "DELIVERED" | "HALTED" | "IN HOLD";

export type ShotNode = {
  id: string;
  scene: string;
  index: number;
  link: LinkKind;
  parentId?: string;
  needsLastFrame?: boolean;
};

export type Bay = ShotNode & {
  state: BayState;
  lastFrameUrl?: string;
};

export function classifyLink(shot: {
  explicitCut?: boolean;
  timeJump?: boolean;
  perspectiveJump?: boolean;
  axisBreak?: boolean;
  otherScene?: boolean;
  inherit?: boolean;
  sameSpace?: boolean;
  matchOnAction?: boolean;
}): LinkKind {
  if (shot.inherit || shot.sameSpace || shot.matchOnAction) return "CHAIN";
  if (
    shot.explicitCut ||
    shot.timeJump ||
    shot.perspectiveJump ||
    shot.axisBreak ||
    shot.otherScene
  ) {
    return "CUT";
  }
  return "CHAIN";
}

export function nextWave(bays: Bay[], cap: number): Bay[] {
  const live = bays.filter((b) => b.state === "ROLLING").length;
  const slots = Math.max(0, cap - live);
  if (!slots) return [];

  const ready = bays.filter((b) => {
    if (b.state !== "STANDBY" && b.state !== "IN HOLD") return false;
    if (b.link === "CUT") return true;
    if (!b.parentId) return true;
    const parent = bays.find((p) => p.id === b.parentId);
    return parent?.state === "DELIVERED" && Boolean(parent.lastFrameUrl);
  });

  return ready.slice(0, slots);
}

export function haltMissingFrame(bays: Bay[], id: string): Bay[] {
  return bays.map((b) => {
    if (b.id !== id) return b;
    if (b.link === "CHAIN" && b.needsLastFrame && !b.lastFrameUrl) {
      return { ...b, state: "HALTED" as const };
    }
    return b;
  });
}
