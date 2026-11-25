// Channel data for the AUDIRA brand marks (<AudiraSignature>, <AudiraOutro>), from src/brand/channel.json.
// That file is written by `npm run channel` (also check-env and render:final) from the series' channel
// and holds every AUDIRA channel, so a project with films for several channels picks one per film:
//   channelOf()        -> the series' channel
//   channelOf("TECH")  -> AUDIRA TECH, whatever the series is
// An unknown code throws, so the render stops instead of crediting the wrong channel.

import data from "./channel.json";

export type AudiraChannel = { name: string; handle: string };
type ChannelFile = AudiraChannel & { code?: string; channels?: Record<string, AudiraChannel> };

export const channelOf = (code?: string): AudiraChannel => {
  const file = data as ChannelFile;
  if (!code) return { name: file.name ?? "", handle: file.handle ?? "" };
  const c = file.channels?.[code];
  if (!c) throw new Error(`AUDIRA channel "${code}" is not in src/brand/channel.json (known: ${Object.keys(file.channels ?? {}).join(", ") || "none"}; run npm run channel)`);
  return c;
};
