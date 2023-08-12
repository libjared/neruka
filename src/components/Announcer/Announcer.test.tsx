import { render, RenderResult, screen } from "@testing-library/react";
import Announcer, { compareDuration, findInitialIdx } from "./Announcer";
import { act } from "react-test-renderer";
import { SignedDuration } from "../Types";

type SetupArgs = {
  duration: SignedDuration;
  volume?: number;
};

type SetupResult = RenderResult & {
  mediaPlay: jest.Mock<Promise<void>, []>;
  getAudio: () => HTMLAudioElement;
  fireCanPlayThrough: () => void;
  fireEnded: () => void;
  changeVolume: (newVolume: number) => void;
};

function setup(args?: SetupArgs): SetupResult {
  const mediaPlay = jest.fn<Promise<void>, []>();
  window.HTMLMediaElement.prototype.play = mediaPlay;

  const duration = args?.duration ?? { negative: false, minutes: 15 };
  const volume = args?.volume ?? 0.5;

  const utils = render(<Announcer duration={duration} volume={volume} />);

  const getAudio = () => screen.getByTitle("announcer") as HTMLAudioElement;
  const fireAudioEvent = (type: string) =>
    act(() => {
      // TODO: replace with fireEvent
      getAudio().dispatchEvent(new Event(type));
    });
  const fireCanPlayThrough = () => fireAudioEvent("canplaythrough");
  const fireEnded = () => fireAudioEvent("ended");
  const changeVolume = (newVolume: number) => {
    utils.rerender(<Announcer duration={duration} volume={newVolume} />);
  };

  return {
    ...utils,
    mediaPlay,
    getAudio,
    fireCanPlayThrough,
    fireEnded,
    changeVolume,
  };
}

it("matches snapshot", () => {
  const { asFragment } = setup();
  expect(asFragment()).toMatchSnapshot();
});

it("plays when loaded and passed", () => {
  const { mediaPlay, fireCanPlayThrough } = setup();
  expect(mediaPlay).not.toHaveBeenCalled();
  fireCanPlayThrough();
  expect(mediaPlay).toHaveBeenCalledTimes(1);
});

it("targets the next milestone when the sound clip ends", () => {
  const { getAudio, fireCanPlayThrough, fireEnded } = setup();
  const audio = getAudio();
  expect(audio.src).toBe("http://localhost/fifteen%20minutes%20to%20go.ogg");
  fireCanPlayThrough();
  fireEnded();
  expect(audio.src).toBe("http://localhost/fourteen.ogg");
});

it("doesn't target anything when all milestones have passed", () => {
  const { getAudio } = setup({
    duration: { negative: true, hours: 3, minutes: 1, seconds: 1 },
  });
  const audio = getAudio();
  expect(audio.src).toBe("");
});

it("sets volume correctly", () => {
  const { getAudio } = setup();
  const audio = getAudio();
  expect(audio.volume).toBe(0.5);
});

it("reacts to changes in volume immediately", () => {
  const { getAudio, changeVolume } = setup();
  const audio = getAudio();
  expect(audio.volume).not.toBe(0.2);
  changeVolume(0.2);
  expect(audio.volume).toBe(0.2);
});

describe("compareDuration", () => {
  it("returns -1 if left < right", () => {
    expect(
      compareDuration(
        { negative: false, minutes: 14, seconds: 59 },
        { negative: false, minutes: 15 }
      )
    ).toBe(-1);
  });

  it("returns 1 if left > right", () => {
    expect(
      compareDuration(
        { negative: false, minutes: 15 },
        { negative: false, minutes: 14, seconds: 59 }
      )
    ).toBe(1);
  });

  it("returns 0 if left = equal", () => {
    expect(
      compareDuration(
        { negative: true, minutes: 14, seconds: 59 },
        { negative: true, minutes: 14, seconds: 59 }
      )
    ).toBe(0);
  });

  it("returns -1 if -left and +right", () => {
    expect(
      compareDuration(
        { negative: true, minutes: 14, seconds: 59 },
        { negative: false, minutes: 1, seconds: 1 }
      )
    ).toBe(-1);
  });

  it("returns 1 if +left and -right", () => {
    expect(
      compareDuration(
        { negative: false, minutes: 1, seconds: 1 },
        { negative: true, minutes: 14, seconds: 59 }
      )
    ).toBe(1);
  });

  it("returns -1 if both are negative and left < right", () => {
    expect(
      compareDuration(
        { negative: true, minutes: 15, seconds: 5 },
        { negative: true, minutes: 14, seconds: 5 }
      )
    ).toBe(-1);
  });

  it("returns 1 if both are negative and left > right", () => {
    expect(
      compareDuration(
        { negative: true, minutes: 14, seconds: 5 },
        { negative: true, minutes: 15, seconds: 5 }
      )
    ).toBe(1);
  });
});

describe("findInitialIdx", () => {
  it("returns 0 for a really large duration", () => {
    const duration = { negative: false, hours: 23 };
    expect(findInitialIdx(duration)).toBe(0);
  });

  it("returns the 14m milestone for exactly 14m", () => {
    const duration = { negative: false, minutes: 14, seconds: 0 };
    expect(findInitialIdx(duration)).toBe(7);
  });

  it("returns the next milestone for 13m59s", () => {
    const duration = { negative: false, minutes: 13, seconds: 59 };
    expect(findInitialIdx(duration)).toBe(8);
  });

  it("returns length for a very overdue duration", () => {
    const duration = { negative: true, hours: 23 };
    expect(findInitialIdx(duration)).toBe(42);
  });
});
