# core/sport — 3D sport library

Code-only (no downloaded models, no licences to track). One athlete, one field painter, one equipment set and one venue serve every sport. Reference scene: `SportsDemoPreview` (540×960, 21 s, one 3 s play per sport) and `SportsDemoWidePreview` (16:9).

```bash
node scripts/stills.mjs out/sports 1.9s,4.7s,7.3s,10s,13.25s,16.1s,19.5s SportsDemoPreview
```

## Scale

`M = 0.6` world units per metre (a ToyPerson at scale 1 ≈ 1.75 m). Use `m(metres)` or `courtPos(x, z)`. Fields lie on y = 0, centred on the origin, length along z.

## Sports (`specs.ts`)

| id | Field (m) | Venue | Equipment |
|---|---|---|---|
| `football` | 105 × 68 | outdoor | `Goal`, `Ball kind="football"` |
| `futsal` | 40 × 20 | indoor | `Goal sport="futsal"`, `Ball kind="futsal"` |
| `basketball` | 28 × 15 | indoor | `Hoop`, `Ball kind="basketball"` |
| `volleyball` | 18 × 9 | indoor | `CourtNet sport="volleyball"` |
| `badminton` | 13.4 × 6.1 | indoor | `CourtNet`, `Racket kind="badminton"`, shuttlecock |
| `tennis` | 23.77 × 10.97 | outdoor | `CourtNet`, `Racket kind="tennis"` |
| `track` | 400 m, 8 lanes | outdoor | — |

The line markings follow the official rules named in `SPORTS[id].rule`. Teams are fictional (`TEAMS`): never real clubs, crests or players.

## Pieces

- `<SportField sport>`: painted surface and lines, cached canvas texture.
- `<Athlete f action u team number position heading rightHand>`: a ToyPerson in a team kit (shirt number on the back).
  - Cyclic actions: `run sprint dribble jog ready keeperReady defend celebrate`. Move the figure at `ACTION_SPEED[action]`.
  - One-shot actions (`u` goes 0 → 1): `kick jumpShot spike smash serve keeperDive`. The contact frame is `ACTION_CONTACT[action]`.
  - `side={-1}` mirrors an action.
- `<Ball kind position spin scale>`: football and futsal (truncated-icosahedron panels), basketball, volleyball, tennis, shuttlecock.
- `<Goal bulge>` makes the net bulge where the ball hits.
- `<Hoop netSwish>`, `<CourtNet>` and `<Racket>` (pass the racket to `rightHand`).
- `<Stadium f sport teams>`: stepped stands with an instanced crowd (thousands of fans, Mexican wave) and LED boards that carry the brand name inside the world.
  - Outdoor: floodlights and roof.
  - Indoor: walls, ceiling lights and a hanging scoreboard.
- `motion.ts`: `seg`, `arc`, `bounce`, `rollSpin` and `headingTo` for ball paths.

## Adding a sport

1. Add an entry to `SPORTS` with its dimensions.
2. Add a painter to `PAINT` in `Field.tsx`.
3. Add any new equipment to `Equipment.tsx`.
4. Add new movements as keys in `poses.ts`.
5. Add a 3 s play to `SportsDemo.tsx`.
