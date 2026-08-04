# RS3 Leagues Companion V3

V3 is a free, modular successor to the legacy single-file V20 app.

## Free stack

- React
- TypeScript
- Vite
- GitHub
- Netlify
- Browser localStorage

No paid database or hosting subscription is required for the current build.

## Current milestone: 2.1 Misthalin Foundation

The V3 preview now includes:

- One persistent player state
- Typed region, location, service, task, and travel schemas
- Stable IDs for every world entity
- A requirement-aware shortest-path graph
- A sourced Misthalin foundation with Lumbridge, Draynor, Wizards' Tower, Varrock, Edgeville, Gunnarsgrunn, and the Varrock Dig Site / Archaeology Campus
- Restricted-service records, including the RS3 Edgeville furnace requirements
- River Lum canoe links gated behind 12 Woodcutting
- Verification status and source references for locations

## Accuracy policy

Location existence, major services, and travel topology are sourced from the RuneScape Wiki. Walking and animation times remain provisional until measured in-game. Any location still marked `needs-review` must not influence production route recommendations yet.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Safety

The stable V20 app remains on the `main` branch. V3 is developed and tested through Netlify deploy previews before any public beta release.
