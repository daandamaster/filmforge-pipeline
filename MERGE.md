# Merge Jarvis into the FixYourFilm house

House = Lovable project `854eee56-82a8-4d80-9799-0cea95efd5ae` / zip `craft-nicely-now` / live `fixyourfilm.today`.
Git hook stub = `daandamaster/fixyourfilm` (almost empty). This repo is hangar kernel + drop-in docs, not a second product.

## Drop-ins

| This file | Goes into the zip |
|---|---|
| `docs/PRODUCT.md` | `docs/PRODUCT.md` |
| `docs/jarvis-lock.ts` | `src/lib/jarvis/lock.ts` |
| `docs/jarvis-fanout.ts` | `src/lib/jarvis/fanout.ts` |
| `docs/jarvis-reserve.ts` | `src/lib/jarvis/reserve.ts` |

## Code edits in the house

1. Add route `/jarvis` (TanStack `src/routes/jarvis.tsx`). Three columns: board / bays / lock+ledger. Port HUD from https://gpp-jarvis-hud.vercel.app — do not iframe `/grokpre`.
2. Reopen `renderProject` **only** when caller is Jarvis + `canFireHangar(seat)` + wave reserved. Keep `GPP_BATCH_RENDER_ENABLED` false on `/console`, `/doorbank`, `/project/$id`.
3. Set live cap from `LIVE_CONCURRENT[seat]` (1 / 16 / 128). Plan caps stay 20 / 240 / 720.
4. First proof: owner seat, 4 CUT plates, Door D only, ledger matches, continuity holds. Then Strike 16. Then Avengers 128.
5. Workshop visiting `/jarvis`: one bay live (floor slot), remaining bays show PRODUCT LOCK + Strike CTA. No empty paywall page.
6. Stitch stays `/studio/film-stitching`. Jarvis never stitches.

## Do not

- Do not add Render all anywhere.
- Do not unlock Jarvis via career rank.
- Do not promise Veo / Kling / 4K in the hangar until that door is live.
- Do not keep HUD $49/mo copy. Packs are Spark/Creator/Studio/Cinema.
