# 🦁 Premier League Tracker

**The whole 2026/27 season in one fast page: table, fixtures, scorers and highlights — live.**

**Live site:** https://epl-tracker.vercel.app

## What it does

- **Live table.** Calculated from results using the Premier League's order (points, goal difference, goals scored),
  with form guide and Champions League / Europa League / relegation zones.
- **Fixtures by matchweek.** Browse every matchweek; live scores refresh every 15–30 seconds.
- **Top scorers and assisters.** Top 5 each, built from match reports.
- **Highlights, only where they play.** Free official YouTube highlights appear only when the video is playable in
  the visitor's country.
- **Rules and season facts** from the Premier League Handbook 2026/27, including this season's law changes.
- **Honest data labels.** Live, cached or offline is always shown.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Deploys to Vercel with zero config.

## How it's built

| Piece | File |
|---|---|
| Clubs, aliases, fallback table | `lib/data.ts` |
| Table logic | `lib/standings.ts` |
| Live match provider (ESPN, per-day, cached) | `lib/espn.ts` |
| Player stats | `lib/stats.ts` |
| Highlights discovery and country check | `lib/highlights.ts` |

## Known limits

- ESPN's feed is unofficial and can change without notice.
- Matchweek numbers are derived from each club's match order, so rearranged fixtures may differ from the official week.
- Highlight availability depends on publishers' territory rules; many matches will have no playable video in your country.
- Head-to-head tie-breakers only matter at season end and aren't applied mid-season.

Not affiliated with the Premier League.
