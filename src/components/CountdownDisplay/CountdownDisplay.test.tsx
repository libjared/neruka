import { act, fireEvent, render, RenderResult, screen } from '@testing-library/react';
import CountdownDisplay, { FriendlyDuration, intervalToDurationCeiling, toFriendlyDuration } from '.';

jest.useFakeTimers();

type SetupResult = RenderResult & {
  advanceClockShort: () => void,
  advanceClockHalfSecond: () => void,
  advanceClockOneSecond: () => void,
  advanceClock505PastTarget: () => void,
  click: () => void,
  handleClick: jest.Mock<void, void[]>,
  expectedTextInitial: string,
  expectedTextOneSecond: string,
  expectedText505PastTarget: string,
};

function setup(): SetupResult {
  const fakeCurrentTime = new Date(2023, 1, 15, 6, 0);
  jest.setSystemTime(fakeCurrentTime);
  const targetTime = new Date(2023, 1, 15, 8, 0);
  const handleClick = jest.fn<void, void[]>();
  const utils: RenderResult = render(<CountdownDisplay targetTime={targetTime} onClick={handleClick} />);
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
  const advanceClock505PastTarget = () => {
    act(() => {
      jest.advanceTimersByTime((((2 * 60 + 5) * 60) + 5) * 1000);
    });
  };
  const click = () => {
    fireEvent.click(screen.getByRole('timer'));
  };

  return {
    ...utils,
    advanceClockShort,
    advanceClockHalfSecond,
    advanceClockOneSecond,
    advanceClock505PastTarget,
    click,
    handleClick,
    expectedTextInitial: '2h00m00s',
    expectedTextOneSecond: '1h59m59s',
    expectedText505PastTarget: '-5m05s',
  };
}

it('renders the correct text', () => {
  const { expectedTextInitial } = setup();
  expect(screen.getByText(expectedTextInitial)).toBeInTheDocument();
});

it('calls handleClick when clicked', () => {
  const { click, handleClick } = setup();
  expect(handleClick).toBeCalledTimes(0);
  click();
  expect(handleClick).toBeCalledTimes(1);
});

it('matches snapshot', () => {
  const { asFragment } = setup();
  expect(asFragment()).toMatchSnapshot();
});

describe('when a short time passes', () => {
  it('matches snapshot', () => {
    const { asFragment, advanceClockShort } = setup();
    advanceClockShort();
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not change the text', () => {
    const { advanceClockShort, expectedTextInitial } = setup();
    advanceClockShort();
    expect(screen.getByText(expectedTextInitial)).toBeInTheDocument();
  });
});

describe('when a half-second passes', () => {
  it('does not change the text because it rounds up', () => {
    const { advanceClockHalfSecond, expectedTextInitial } = setup();
    advanceClockHalfSecond();
    expect(screen.getByText(expectedTextInitial)).toBeInTheDocument();
  });
});

describe('when a second passes', () => {
  it('matches snapshot', () => {
    const { asFragment, advanceClockOneSecond } = setup();
    advanceClockOneSecond();
    expect(asFragment()).toMatchSnapshot();
  });

  it('changes the text', () => {
    const { advanceClockOneSecond, expectedTextOneSecond } = setup();
    advanceClockOneSecond();
    expect(screen.getByText(expectedTextOneSecond)).toBeInTheDocument();
  });
});

describe('when the target time has passed', () => {
  it('shows a negative', () => {
    const { advanceClock505PastTarget, expectedText505PastTarget } = setup();
    advanceClock505PastTarget();
    expect(screen.getByText(expectedText505PastTarget)).toBeInTheDocument();
  });
});

describe('toFriendlyDuration', () => {
  it('returns 0s when nothing is passed', () => {
    expect(toFriendlyDuration({ negative: false })).toEqual<FriendlyDuration>({
      negative: false,
      secondOnes: '0',
    });
  });

  it('rejects ranges above a day', () => {
    expect(() => {
      toFriendlyDuration({ negative: false, days: 1 });
    }).toThrowError("Expected days to be 0 or undefined.");
  });

  it('rejects durations with fractional members', () => {
    expect(() => {
      toFriendlyDuration({ negative: false, hours: 0.5, minutes: 13 });
    }).toThrowError("Expected hours to be a whole number.");
  });

  it('rejects durations with negative members', () => {
    expect(() => {
      toFriendlyDuration({ negative: false, hours: 1, minutes: -13 });
    }).toThrowError("Expected minutes to be a whole number.");
  });

  it('returns 15s', () => {
    expect(toFriendlyDuration({ negative: false, hours: 0, minutes: 0, seconds: 15 })).toEqual<FriendlyDuration>({
      negative: false,
      secondTens: '1',
      secondOnes: '5',
    });
  });

  it('returns 80h05m40s', () => {
    expect(toFriendlyDuration({ negative: false, hours: 80, minutes: 5, seconds: 40 })).toEqual<FriendlyDuration>({
      negative: false,
      hourTens: '8',
      hourOnes: '0',
      minuteTens: '0',
      minuteOnes: '5',
      secondTens: '4',
      secondOnes: '0',
    });
  });

  it('returns -15s', () => {
    expect(toFriendlyDuration({ negative: true, hours: 0, minutes: 0, seconds: 15 })).toEqual<FriendlyDuration>({
      negative: true,
      secondTens: '1',
      secondOnes: '5',
    });
  });
});

describe('intervalToDurationCeiling', () => {
  it('rounds up', () => {
    const result = intervalToDurationCeiling({
      start: new Date(1677104120048),
      end: new Date(1677208120153),
    });
    expect(result).toEqual({ negative: false, years: 0, months: 0, days: 1, hours: 4, minutes: 53, seconds: 21 });
  });

  it('doesnt round when the difference is exact', () => {
    const result = intervalToDurationCeiling({
      start: new Date(1677104120048),
      end: new Date(1677208120153-105),
    });
    expect(result).toEqual({ negative: false, years: 0, months: 0, days: 1, hours: 4, minutes: 53, seconds: 20 });
  });

  it('returns a negative duration when past', () => {
    const result = intervalToDurationCeiling({
      start: new Date(1677208120153-105),
      end: new Date(1677104120048),
    });
    expect(result).toEqual({ negative: true, years: 0, months: 0, days: 1, hours: 4, minutes: 53, seconds: 20 });
  });
});
