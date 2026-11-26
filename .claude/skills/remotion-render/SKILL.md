---
name: remotion-render
description: Export a Remotion video
version: 4.0.541
---

> **AUDIRA override:** `npx remotion render` / `still` di bawah hanya untuk still dan klip cek pendek. Final hanya lewat `npm run render:final -- ... --sfx=public/audio/sfx.wav --vo=public/audio/vo.wav --jobs=6 --concurrency=2 --gl=vulkan --encoder=nvenc` atau `audira_render_batch`, setelah acc tahap 9.

## General rendering strategy

Use Remotion's bundled browser for rendering, including compositions using
`<HtmlInCanvas>`. It includes the required browser APIs and Remotion's browser
fixes. Let Remotion download or update it as needed. Do not reuse a recording
browser or set `--browser-executable`, `browserExecutable`, or `chromeMode`
unless the user explicitly requests a different browser.

Render a video using:

```
npx remotion render
```

Full list of options: https://www.remotion.dev/docs/cli/render.md

Render a still using:

```
npx remotion still
```

Full list of options: https://www.remotion.dev/docs/cli/still.md

To render several frames as images in one call, use `render --frames`:

```
npx remotion render [composition-id] out/frames --frames=0,30,90 --image-format=png
```

See https://www.remotion.dev/docs/cli/render.md#--frames for more options.

## Transparent videos

See [Transparent videos](./transparent-videos.md) for rendering out a video with transparency.
