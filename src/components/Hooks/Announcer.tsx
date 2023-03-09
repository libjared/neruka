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
  { at: { negative: false, minutes: 15 }, sound: audioClips.remain15m },
  {
    at: { negative: false, minutes: 14, seconds: 50 },
    sound: audioClips.remain15m,
  },
  { at: { negative: false, minutes: 14 }, sound: audioClips.remain15m },
  { at: { negative: false, seconds: 1 }, sound: audioClips.remain15m },
  { at: { negative: false, seconds: 0 }, sound: audioClips.remain15m },
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
    currentMilestone !== null
      ? compareDuration(duration, currentMilestone.at) !== 1
      : false;

  // TODO: what are the implications of having this inside the effect vs outside?
  const shouldPlay = isPassed && isLoaded && !isPlaying;

  useEffect(() => {
    if (!shouldPlay) {
      return;
    }
    if (audioRef.current === null) {
      throw new Error("Expected audioRef.current not to be null.");
      // because how would this ref not be defined, if isLoaded is true?
    }
    if (currentMilestone === null) {
      throw new Error("Expected currentMilestone not to be null.");
    }
    const actualSrc = audioRef.current.src;
    const expectSrc = currentMilestone.sound.src;
    if (!actualSrc.endsWith(expectSrc)) {
      throw new Error(
        `Expected audioRef.current.src to end with ${expectSrc}, but it was ${actualSrc}.`
      );
    }
    setIsPlaying(true);
    audioRef.current.play();
  }, [currentMilestone, shouldPlay]);

  return (
    <>
      <audio
        ref={audioRef}
        src={currentMilestone?.sound.src}
        onCanPlayThrough={() => {
          setIsLoaded(true);
        }}
        onEnded={() => {
          if (audioRef.current === null) {
            throw new Error("Expected audioRef.current not to be null.");
          }
          const newSrc = currentMilestone?.sound.src;
          const currentSrc = audioRef.current.src;

          // If the milestone that just ended has the same src as the next,
          // <audio src> attribute won't change, thus onCanPlayThrough won't fire next time.
          // We'll be waiting forever for it to load, not aware it already has. So let's keep it loaded.
          if (newSrc === undefined || !isSrcEqual(currentSrc, newSrc)) {
            setIsLoaded(false);
          }
          setIsPlaying(false);
          setCurrentIdx((cidx) => cidx + 1);
        }}
      />
    </>
  );
}, propsAreEqual);

function isSrcEqual(currentSrc: string, newSrc: string): boolean {
  return currentSrc.endsWith(newSrc);
}

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
