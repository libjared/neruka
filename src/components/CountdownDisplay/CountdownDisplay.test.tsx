import { act, render, RenderResult, screen } from '@testing-library/react';
import CountdownDisplay, { FriendlyDuration, toFriendlyDuration } from '.';

jest.useFakeTimers();

type SetupResult = RenderResult & {
  advanceClockShort: () => void,
  advanceClockOneSecond: () => void,
  expectedTextInitial: string,
  expectedTextOneSecond: string,
};

function setup(): SetupResult {
  const fakeCurrentTime = new Date(2023, 1, 15, 6, 0);
  jest.setSystemTime(fakeCurrentTime);
  const targetTime = new Date(2023, 1, 15, 8, 0);
  const utils: RenderResult = render(<CountdownDisplay targetTime={targetTime} />);
  const advanceClockShort = () => {
    act(() => {
      jest.advanceTimersByTime(199);
    });
  };
  const advanceClockOneSecond = () => {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  };

  return {
    ...utils,
    advanceClockShort,
    advanceClockOneSecond,
    expectedTextInitial: '2h00m00s',
    expectedTextOneSecond: '1h59m59s'
  };
}

it('renders the correct text', () => {
  const { expectedTextInitial } = setup();
  expect(screen.getByText(expectedTextInitial)).toBeInTheDocument();
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

  // it('shows a negative value for targets in the past')
});

describe('toFriendlyDuration', () => {
  it('returns 0s when nothing is passed', () => {
    expect(toFriendlyDuration({})).toEqual<FriendlyDuration>({
      secondOnes: '0',
    });
  });

  it('rejects ranges above a day', () => {
    expect(() => {
      toFriendlyDuration({ days: 1 });
    }).toThrowError("Expected days to be 0 or undefined.");
  });

  it('rejects durations with fractional members', () => {
    expect(() => {
      toFriendlyDuration({ hours: 0.5, minutes: 13 });
    }).toThrowError("Expected hours to be a whole number.");
  });

  it('rejects durations with negative members', () => {
    expect(() => {
      toFriendlyDuration({ hours: 1, minutes: -13 });
    }).toThrowError("Expected minutes to be a whole number.");
  });

  it('returns 15s', () => {
    expect(toFriendlyDuration({ hours: 0, minutes: 0, seconds: 15 })).toEqual<FriendlyDuration>({
      secondTens: '1',
      secondOnes: '5',
    });
  });

  it('returns 80h05m40s', () => {
    expect(toFriendlyDuration({ hours: 80, minutes: 5, seconds: 40 })).toEqual<FriendlyDuration>({
      hourTens: '8',
      hourOnes: '0',
      minuteTens: '0',
      minuteOnes: '5',
      secondTens: '4',
      secondOnes: '0',
    });
  });
});
