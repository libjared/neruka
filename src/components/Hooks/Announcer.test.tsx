import { render, screen } from "@testing-library/react";
import Announcer, { compareDuration, findInitialIdx } from "./Announcer";
import { act } from "react-test-renderer";

function setup() {
  const mediaPlay = jest.fn();
  window.HTMLMediaElement.prototype.play = mediaPlay;
  const originalJsx = <Announcer duration={{ negative: false, minutes: 15 }} />;
  const utils = render(originalJsx);
  return {
    ...utils,
    originalJsx,
    mediaPlay,
  };
}

it("matches snapshot", () => {
  const { asFragment } = setup();
  expect(asFragment()).toMatchSnapshot();
});

it("plays when loaded and passed", async () => {
  const { mediaPlay } = setup();
  expect(mediaPlay).not.toHaveBeenCalled();
  const audio = screen.getByTitle("announcer");
  act(() => {
    audio!.dispatchEvent(new Event("canplaythrough"));
  });
  expect(mediaPlay).toHaveBeenCalledTimes(1);
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

  it("returns 1 for exactly 14m", () => {
    const duration = { negative: false, minutes: 14, seconds: 0 };
    expect(findInitialIdx(duration)).toBe(1);
  });

  it("returns 2 for 13m59s", () => {
    const duration = { negative: false, minutes: 13, seconds: 59 };
    expect(findInitialIdx(duration)).toBe(2);
  });
});
