import React from "react";
import { useEffect, useRef, useState } from "react";
import audioClips, { AudioClip } from "../../data/AudioClips";
import { SignedDuration } from "../Types";

type MilestoneDefinition = {
  at: SignedDuration;
  sound: AudioClip;
};

// list of milestones and their associated clips.
// sorted by `at` in descending order.
const MilestoneList: ReadonlyArray<MilestoneDefinition> = [
  {
    at: { negative: false, hours: 3 },
    sound: audioClips.vox03htogo,
  },
  {
    at: { negative: false, hours: 2 },
    sound: audioClips.vox02htogo,
  },
  {
    at: { negative: false, hours: 1 },
    sound: audioClips.vox01htogo,
  },
  {
    at: { negative: false, minutes: 30 },
    sound: audioClips.vox30mtogo,
  },
  {
    at: { negative: false, minutes: 15 },
    sound: audioClips.vox15mtogo,
  },
  {
    at: { negative: false, minutes: 14 },
    sound: audioClips.vox14,
  },
  {
    at: { negative: false, minutes: 13 },
    sound: audioClips.vox13,
  },
  {
    at: { negative: false, minutes: 12 },
    sound: audioClips.vox12,
  },
  {
    at: { negative: false, minutes: 11 },
    sound: audioClips.vox11,
  },
  {
    at: { negative: false, minutes: 10 },
    sound: audioClips.vox10,
  },
  {
    at: { negative: false, minutes: 9 },
    sound: audioClips.vox09,
  },
  {
    at: { negative: false, minutes: 8 },
    sound: audioClips.vox08,
  },
  {
    at: { negative: false, minutes: 7 },
    sound: audioClips.vox07,
  },
  {
    at: { negative: false, minutes: 6 },
    sound: audioClips.vox06,
  },
  {
    at: { negative: false, minutes: 5 },
    sound: audioClips.vox05,
  },
  {
    at: { negative: false, minutes: 4 },
    sound: audioClips.vox04,
  },
  {
    at: { negative: false, minutes: 3 },
    sound: audioClips.vox03,
  },
  {
    at: { negative: false, minutes: 2 },
    sound: audioClips.vox02,
  },
  {
    at: { negative: false, minutes: 1 },
    sound: audioClips.vox01mrem,
  },
  {
    at: { negative: false, seconds: 30 },
    sound: audioClips.vox30s,
  },
  {
    at: { negative: false, seconds: 10 },
    sound: audioClips.vox10,
  },
  {
    at: { negative: false, seconds: 9 },
    sound: audioClips.vox09,
  },
  {
    at: { negative: false, seconds: 8 },
    sound: audioClips.vox08,
  },
  {
    at: { negative: false, seconds: 7 },
    sound: audioClips.vox07,
  },
  {
    at: { negative: false, seconds: 6 },
    sound: audioClips.vox06,
  },
  {
    at: { negative: false, seconds: 5 },
    sound: audioClips.vox05,
  },
  {
    at: { negative: false, seconds: 4 },
    sound: audioClips.vox04,
  },
  {
    at: { negative: false, seconds: 3 },
    sound: audioClips.vox03,
  },
  {
    at: { negative: false, seconds: 2 },
    sound: audioClips.vox02,
  },
  {
    at: { negative: false, seconds: 1 },
    sound: audioClips.vox01,
  },
  {
    at: { negative: false, seconds: 0 },
    sound: audioClips.vox00,
  },
  {
    at: { negative: true, seconds: 10 },
    sound: audioClips.voxTimeAway,
  },
];

type AnnouncerProps = {
  duration: SignedDuration;
};

const Announcer = React.memo(({ duration }: AnnouncerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  // the idx of the next upcoming milestone, or the one whose sound we're currently playing.
  const [currentIdx, setCurrentIdx] = useState<number>(() =>
    findInitialIdx(duration)
  );
  // flag indicating whether the audio at `src` is loaded enough to play right now.
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  // flag indicating whether the audio is currently busy saying the milestone at currentIdx.
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const currentMilestone: MilestoneDefinition | null =
    currentIdx < MilestoneList.length ? MilestoneList[currentIdx] : null;

  const isPassed =
    currentMilestone !== null &&
    compareDuration(duration, currentMilestone.at) !== 1;

  // TODO: what are the implications of having this inside the effect vs outside?
  const shouldPlay = isPassed && isLoaded && !isPlaying;

  useEffect(() => {
    if (!shouldPlay) {
      return;
    }
    setIsPlaying(true);
    // audioRef must exist if isLoaded is true
    audioRef.current!.play();
  }, [currentMilestone, shouldPlay]);

  return (
    <>
      <audio
        title="announcer"
        ref={audioRef}
        src={currentMilestone?.sound.src}
        onCanPlayThrough={() => {
          setIsLoaded(true);
        }}
        onEnded={() => {
          // FIXME: If the milestone that just ended has the same src as the
          // next, <audio src> attribute won't change, thus onCanPlayThrough
          // won't fire next time. We'll be waiting forever for it to load,
          // not aware it already has. We can't reliably check this, so two
          // milestones sharing the same sound src is unsupported.
          setIsLoaded(false);
          setIsPlaying(false);
          setCurrentIdx((cidx) => cidx + 1);
        }}
      />
    </>
  );
}, propsAreEqual);

function propsAreEqual(
  prevProps: Readonly<AnnouncerProps>,
  nextProps: Readonly<AnnouncerProps>
): boolean {
  return signedDurationEqual(prevProps.duration, nextProps.duration);
}

function signedDurationEqual(a: SignedDuration, b: SignedDuration): boolean {
  return (
    a.hours === b.hours &&
    a.minutes === b.minutes &&
    a.seconds === b.seconds &&
    a.negative === b.negative
  );
}

/**
 * Finds the first milestone that is less than or equal to the passed duration, and returns its index.
 * @param duration
 * @returns the index of the initial duration, or a number equal to MilestoneList.length if none were found.
 */
function findInitialIdx(duration: SignedDuration): number {
  let idx;
  for (idx = 0; idx < MilestoneList.length; idx++) {
    const milestone = MilestoneList[idx];
    if (compareDuration(duration, milestone.at) !== -1) {
      return idx;
    }
  }
  return idx; // MilestoneList.length
}

// returns -1 if left is less than right.
// returns 1 if left is greater than right.
// returns 0 if equal.
function compareDuration(left: SignedDuration, right: SignedDuration): number {
  if (left.negative && !right.negative) {
    return -1;
  }
  if (!left.negative && right.negative) {
    return 1;
  }
  const flipResult = left.negative && right.negative ? -1 : 1;
  const hrDiff = (left.hours ?? 0) - (right.hours ?? 0);
  const minDiff = (left.minutes ?? 0) - (right.minutes ?? 0);
  const secDiff = (left.seconds ?? 0) - (right.seconds ?? 0);
  if (hrDiff !== 0) {
    return Math.sign(hrDiff) * flipResult;
  }
  if (minDiff !== 0) {
    return Math.sign(minDiff) * flipResult;
  }
  if (secDiff !== 0) {
    return Math.sign(secDiff) * flipResult;
  }
  return 0;
}

export default Announcer;
export { compareDuration, findInitialIdx };
