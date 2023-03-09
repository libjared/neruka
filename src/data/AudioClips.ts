import quack from "./assets/quack.ogg";

type AudioClip = { src: string };

const audioClips: Record<string, AudioClip> = {
  remain15m: {
    src: quack,
  },
};

export default audioClips;
export type { AudioClip };
