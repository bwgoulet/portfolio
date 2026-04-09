# My Climb — Point-and-Click Adventure Prototype

A browser-native Next.js + React Three Fiber prototype for a cinematic, Myst-inspired personal site concept.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current scene layout (from sketch)

- Large mountain backdrop with a trailhead leading toward it.
- Trail currently blocked near the mountain (future unlock point).
- Clickable billboard for projects (styled with post-it placeholders).
- Stone tablets area for work experience/progression storytelling.
- Clickable cabin with door focus transition for About/Gallery entry.

## Interaction states

- `idleOverview`
- `hoverBillboard`
- `hoverCabin`
- `transitioning`
- `billboardCloseup`
- `cabinCloseup`

## Architecture overview

```text
app/
  layout.tsx                # App shell + hydration warning suppression
  page.tsx                  # Scene entry page
components/scene/
  AdventureScene.tsx        # Scene orchestrator + interaction state machine
  CameraRig.tsx             # Camera preset tweening (overview <-> focus target)
  Billboard.tsx             # Interactive projects sign
  Cabin.tsx                 # Interactive cabin/door landmark
  LowPolyEnvironment.tsx    # Island, mountain, trailhead, blockers, tablets
  LightingAtmosphere.tsx    # Fog and lights
  types.ts                  # Shared scene state types
config/
  sceneConfig.ts            # Camera presets, anchors, animation timing, palette
lib/
  animation.ts              # Thin GSAP helpers
```

## Fast iteration points

- Camera framing: `CAMERA_PRESETS` in `config/sceneConfig.ts`.
- Layout/object positions: `SCENE_ANCHORS` in `config/sceneConfig.ts`.
- Animation timing/easing: `ANIMATION_CONFIG` in `config/sceneConfig.ts`.
- Replace placeholders with glTF: swap `LowPolyEnvironment` for a Drei `useGLTF` model component.
- Expand navigation: add landmark metadata + target preset pairs, then reuse current click/hover pattern.

## Texture downscaling helper

Use the built-in script to batch downscale textures for runtime performance:

```bash
npm run textures:downscale -- --dry-run
npm run textures:downscale -- --max-color 2048 --max-data 1024
```

Default behavior writes optimized files to `public/textures-optimized`.
Use `--in-place` to overwrite `public/textures` once you've reviewed output quality.
