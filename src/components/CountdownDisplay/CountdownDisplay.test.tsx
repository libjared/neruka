import {
  act,
  fireEvent,
  render,
  RenderResult,
  screen,
} from "@testing-library/react";
import CountdownDisplay, {
  intervalToDurationCeiling,
  toFriendlyDuration,
} from ".";
import { FriendlyDuration } from "../Types";

jest.useFakeTimers();

type SetupResult = RenderResult & {
  advanceClockShort: () => void;
  advanceClockHalfSecond: () => void;
  advanceClockOneSecond: () => void;
  advanceClockToTarget: () => void;
  advanceClock505PastTarget: () => void;
  click: () => void;
  handleClick: jest.Mock<void, void[]>;
  expectedTextInitial: string;
  expectedTextOneSecond: string;
  expectedTextTarget: string;
  expectedText505PastTarget: string;
};

function setup(): SetupResult {
  const fakeCurrentTime = new Date(2023, 1, 15, 0, 0);
  jest.setSystemTime(fakeCurrentTime);
  const targetTime = new Date(2023, 1, 15, 11, 0);
  const handleClick = jest.fn<void, void[]>();
  const utils: RenderResult = render(
    <CountdownDisplay targetTime={targetTime} onClick={handleClick} />
  );
  const advanceClockShort = () => {
    act(() => {
      jest.advanceTimersByTime(199);
    });
  };
  const advanceClockHalfSecond = () => {
    act(() => {
      jest.advanceTimersByTime(500);
    });
  };
  const advanceClockOneSecond = () => {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  };
  const advanceClockToTarget = () => {
    act(() => {
      const hrs = 11;
      const mins = 0;
      const secs = 0;
      jest.advanceTimersByTime(((hrs * 60 + mins) * 60 + secs) * 1000);
    });
  };
  const advanceClock505PastTarget = () => {
    act(() => {
      const hrs = 11;
      const mins = 5;
      const secs = 5;
      jest.advanceTimersByTime(((hrs * 60 + mins) * 60 + secs) * 1000);
    });
  };
  const click = () => {
    fireEvent.click(screen.getByRole("timer"));
  };

  return {
    ...utils,
    advanceClockShort,
    advanceClockHalfSecond,
    advanceClockOneSecond,
    advanceClockToTarget,
    advanceClock505PastTarget,
    click,
    handleClick,
    // TODO is it necessary to include these as utils
    expectedTextInitial: "11h00m00s",
    expectedTextOneSecond: "10h59m59s",
    expectedTextTarget: "0s",
    expectedText505PastTarget: "-5m05s",
  };
}

it("renders the correct text", () => {
  const { expectedTextInitial } = setup();
  expect(screen.getByText(expectedTextInitial)).toBeInTheDocument();
});

// it("renders the correct text B", () => {
//   const targetTime = new Date(2023, 1, 15, 11, 0);
//   const handleClick = jest.fn<void, void[]>();
//   const utils: RenderResult = render(
//     <CountdownDisplay targetTime={targetTime} onClick={handleClick} />
//   );
//   expect();
// });

it("calls handleClick when clicked", () => {
  const { click, handleClick } = setup();
  expect(handleClick).toBeCalledTimes(0);
  click();
  expect(handleClick).toBeCalledTimes(1);
});

it("matches snapshot", () => {
  const { asFragment } = setup();
  expect(asFragment()).toMatchSnapshot();
});

describe("when a short time passes", () => {
  it("matches snapshot", () => {
    const { asFragment, advanceClockShort } = setup();
    advanceClockShort();
    expect(asFragment()).toMatchSnapshot();
  });

  it("does not change the text", () => {
    const { advanceClockShort, expectedTextInitial } = setup();
    advanceClockShort();
    expect(screen.getByText(expectedTextInitial)).toBeInTheDocument();
  });
});

describe("when a half-second passes", () => {
  it("does not change the text because it rounds up", () => {
    const { advanceClockHalfSecond, expectedTextInitial } = setup();
    advanceClockHalfSecond();
    expect(screen.getByText(expectedTextInitial)).toBeInTheDocument();
  });
});

describe("when a second passes", () => {
  it("matches snapshot", () => {
    const { asFragment, advanceClockOneSecond } = setup();
    advanceClockOneSecond();
    expect(asFragment()).toMatchSnapshot();
  });

  it("changes the text", () => {
    const { advanceClockOneSecond, expectedTextOneSecond } = setup();
    advanceClockOneSecond();
    expect(screen.getByText(expectedTextOneSecond)).toBeInTheDocument();
  });
});

describe("when the target time is exactly now", () => {
  it("shows 0s", () => {
    const { advanceClockToTarget, expectedTextTarget } = setup();
    advanceClockToTarget();
    expect(screen.getByText(expectedTextTarget)).toBeInTheDocument();
  });
});

describe("when the target time has passed", () => {
  it("shows a negative", () => {
    const { advanceClock505PastTarget, expectedText505PastTarget } = setup();
    advanceClock505PastTarget();
    expect(screen.getByText(expectedText505PastTarget)).toBeInTheDocument();
  });
});

describe("toFriendlyDuration", () => {
  it("returns 0s when nothing is passed", () => {
    expect(toFriendlyDuration({ negative: false })).toEqual<FriendlyDuration>({
      negative: false,
      secondOnes: "0",
    });
  });

  it("rejects durations with fractional members", () => {
    expect(() => {
      toFriendlyDuration({ negative: false, hours: 0.5, minutes: 13 });
    }).toThrowError("Expected hours to be a whole number.");
  });

  it("rejects durations with negative members", () => {
    expect(() => {
      toFriendlyDuration({ negative: false, hours: 1, minutes: -13 });
    }).toThrowError("Expected minutes to be a whole number.");
  });

  it("rejects durations with fractional negative members", () => {
    expect(() => {
      toFriendlyDuration({ negative: false, seconds: 1 / -2 });
    }).toThrowError("Expected seconds to be a whole number.");
  });

  it("rejects -0s", () => {
    expect(() => {
      toFriendlyDuration({ negative: true });
    }).toThrowError("Expected duration not to be negative 0.");
  });

  it("returns 15s", () => {
    expect(
      toFriendlyDuration({ negative: false, hours: 0, minutes: 0, seconds: 15 })
    ).toEqual<FriendlyDuration>({
      negative: false,
      secondTens: "1",
      secondOnes: "5",
    });
  });

  it("returns 80h05m40s", () => {
    expect(
      toFriendlyDuration({
        negative: false,
        hours: 80,
        minutes: 5,
        seconds: 40,
      })
    ).toEqual<FriendlyDuration>({
      negative: false,
      hourTens: "8",
      hourOnes: "0",
      minuteTens: "0",
      minuteOnes: "5",
      secondTens: "4",
      secondOnes: "0",
    });
  });

  it("returns -15s", () => {
    expect(
      toFriendlyDuration({ negative: true, hours: 0, minutes: 0, seconds: 15 })
    ).toEqual<FriendlyDuration>({
      negative: true,
      secondTens: "1",
      secondOnes: "5",
    });
  });

  it("returns 0s", () => {
    expect(
      toFriendlyDuration({ negative: false, hours: 0, minutes: 0, seconds: 0 })
    ).toEqual<FriendlyDuration>({
      negative: false,
      secondOnes: "0",
    });
  });
});

describe("intervalToDurationCeiling", () => {
  const base = 1677104120048;

  it("rounds up", () => {
    const result = intervalToDurationCeiling({
      start: new Date(base),
      end: new Date(base + 17600105),
    });
    expect(result).toEqual({
      negative: false,
      hours: 4,
      minutes: 53,
      seconds: 21,
    });
  });

  it("doesnt round when the difference is exact", () => {
    const result = intervalToDurationCeiling({
      start: new Date(base),
      end: new Date(base + 17600000),
    });
    expect(result).toEqual({
      negative: false,
      hours: 4,
      minutes: 53,
      seconds: 20,
    });
  });

  it("returns a negative duration when past", () => {
    const result = intervalToDurationCeiling({
      start: new Date(base),
      end: new Date(base - (104000000 - 86400000)),
    });
    expect(result).toEqual({
      negative: true,
      hours: 4,
      minutes: 53,
      seconds: 20,
    });
  });

  function testRounding(msAfter: number, expectedSeconds: number) {
    it(`returns ${expectedSeconds}s when ${(msAfter / 1000.0).toFixed(
      3
    )}s after`, () => {
      const result = intervalToDurationCeiling({
        start: new Date(base),
        end: new Date(base - msAfter),
      });
      expect(result).toEqual({
        negative: expectedSeconds < 0,
        hours: 0,
        minutes: 0,
        seconds: Math.abs(expectedSeconds),
      });
    });
  }

  describe("returns correctly-rounded durations at precise moments", () => {
    testRounding(-1001, 2);
    testRounding(-1000, 1);
    testRounding(-999, 1);
    testRounding(-1, 1);
    testRounding(0, 0);
    testRounding(1, 0);
    testRounding(999, 0);
    testRounding(1000, -1);
    testRounding(1001, -1);
  });
});
