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
