---
name: remotion-best-practices
description: Remotion technical reference for AUDIRA (markup and effects, captions, maps, multimedia, render). Remotion + R3F is the default engine since 2026-11-17. For making an AUDIRA video, follow audira-motion and the 11-stage pipeline first; use this only for Remotion how-to details.
version: 4.0.541
---

> **Remotion + R3F adalah engine default AUDIRA sejak 2026-11-17.** world3d (Three.js in HyperFrames) hanya bila pengguna memaksa.
>
> **AUDIRA adaptation (2026-11-09).** In AUDIRA, a new video follows `audira-motion` and the 11-stage pipeline in CLAUDE.md (style gate, script gate, voice-over as master clock, contact-sheet draft, one final render). The upstream advice below to load `remotion-create` and open Remotion Studio for every new video does not apply; render drafts as contact sheets, not previews. Only 6 of the 13 upstream skills are adopted (see UPSTREAM.md); links to the others go to the Remotion docs.


## Preserve user changes

Users may make edits in the code outside of the conversation.

If you detect a surprising change made in the meanwhile, don't overwrite it, assume it was intentional or ask for confirmation.

## Creating a video

Untuk video AUDIRA ikuti `audira-motion` + pipeline 11 tahap dulu (Remotion + R3F memang engine default). Hanya untuk how-to Remotion mentah: if the user asks to make, create, or build a new Remotion video or composition, load [Create a new Remotion video](https://www.remotion.dev/docs/ai/skills) (not adopted in AUDIRA: remotion-create), whether or not a Remotion project already exists.

## New project setup

If no Remotion project currently exists, load [Create a new Remotion project](https://www.remotion.dev/docs/ai/skills) (not adopted in AUDIRA: remotion-create)

## React Markup Best Practices

If you are writing Remotion React Markup, load [Remotion Markup Best Practices](../remotion-markup/SKILL.md)

## Maps

For static maps, animated routes and markers, geographic explainers, Mapbox, MapLibre, MapTiler, GeoJSON, or 3D geographic flyovers, load [Remotion Maps](../remotion-maps/SKILL.md).

## Multimedia

For achieving multimedia tasks in the browser, such as trimming, cropping videos, or getting metadata from them, load [Remotion Multimedia](../remotion-multimedia/SKILL.md)

For video matting, background removal, or placing content behind a subject,
load [Remotion Markup](../remotion-markup/SKILL.md).

## Improving Interactivity

By structuring the Remotion markup well, we can allow users to interactively change things in the Studio and write back to code. If relevant: [Interactivity Best Practices](https://www.remotion.dev/docs/ai/skills) (not adopted in AUDIRA: remotion-interactivity)

## Open the preview

If the user asks to "make" a video, "create" a video, etc.
Don't render the video by default unless they are very explicit. They want to instead see an interactive preview.
As soon as the project can run, start Studio and open the preview in the browser before building or editing the composition. Keep it open while you work so the user can watch progress and steer.

### If you are using Cursor

Run Studio without `--no-open` so it opens the browser automatically:

```bash
npx remotion studio
```

### If you are using another agent client with an in-app browser

You can use the command above to let Studio open the browser, or run:

```bash
npx remotion studio --no-open
```

This will start a long-running process and print the server URL for the preview.  
If the server is already started, it will print the URL.
If you use `--no-open`, open the exact printed URL in the in-app browser and verify that Studio loads. Once a composition exists, verify that its video preview loads. If you cannot open it there, run Studio without `--no-open`.
You can visit a specific composition by navigating to `/[composition-id]`, for example `http://localhost:3000/MapAnimation`.

:::note
The Studio supports WebMCP tools.
:::

### If you do not have an in-app browser

This will open the Studio in the browser or refocus it if it is already open.

```bash
npx remotion studio
```

### More options

To launch a project in Remotion Studio, open its exact local URL, or configure Studio CLI flags, load [Remotion Studio](https://www.remotion.dev/docs/ai/skills) (not adopted in AUDIRA: remotion-studio).

## Render the video

Only render if the user is very explicit in asking for it.  
E.g. "Render the video", "Export", "Give me the MP4".

The preview also has a more intuitive rendering interface, so consider using it instead of the command line for rendering.

```
npx remotion render
```

For more options, see [Rendering](../remotion-render/SKILL.md).

For advanced rendering beyond simple `npx remotion render`, see: [Rendering Best Practices](../remotion-render/SKILL.md)

## Captions

When working with Captions, load [Remotion Captions](../remotion-captions/SKILL.md).

## Creating a SaaS, automation or application

Use the [Remotion SaaS skill](https://www.remotion.dev/docs/ai/skills) (not adopted in AUDIRA: remotion-saas) for knowledge about Remotion-powered SaaS apps, such as `<Player>`, rendering on Lambda, Vercel, Cloudflare, via Express.js, client-side rendering, or for finding the right SaaS template.

## Looking up Remotion APIs and documentation

To find and read current Remotion documentation, load [Remotion Docs](https://www.remotion.dev/docs/ai/skills) (not adopted in AUDIRA: remotion-docs).

## Licensing

For Remotion license information, FAQs, terms, or buying a license, load [Remotion License](https://www.remotion.dev/docs/ai/skills) (not adopted in AUDIRA: remotion-license).

## Upgrading

To upgrade Remotion, related packages, compatible Mediabunny packages, and installed Remotion Agent Skills, load [Remotion Upgrade](https://www.remotion.dev/docs/ai/skills) (not adopted in AUDIRA: remotion-upgrade).
