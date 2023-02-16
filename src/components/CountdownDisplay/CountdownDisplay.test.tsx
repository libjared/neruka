import { act, render, RenderResult, screen } from '@testing-library/react';
import CountdownDisplay from '.';

jest.useFakeTimers();

type SetupResult = RenderResult & {
  advanceClockHalfSecond: () => void,
  advanceClockOneSecond: () => void,
  expectedTextInitial: string,
  expectedTextOneSecond: string,
};

function setup(): SetupResult {
  const fakeCurrentTime = new Date(2023, 1, 15, 6, 0);
  jest.setSystemTime(fakeCurrentTime);
  const targetTime = new Date(2023, 1, 15, 8, 0);
  const utils: RenderResult = render(<CountdownDisplay targetTime={targetTime} />);
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

  return {
    ...utils,
    advanceClockHalfSecond,
    advanceClockOneSecond,
    expectedTextInitial: 'pretend this is a countdown from 2023-02-15T06:00:00Z to 2023-02-15T08:00:00Z',
    expectedTextOneSecond: 'pretend this is a countdown from 2023-02-15T06:00:01Z to 2023-02-15T08:00:00Z'
  };
}

it('renders the correct text', () => {
  const { expectedTextInitial } = setup();
  expect(screen.getByText(/pretend/)).toHaveTextContent(expectedTextInitial);
});

// it('matches snapshot', () => {
//   const { asFragment } = setup();
//   expect(asFragment()).toMatchSnapshot();
// });

describe('when a half-second passes', () => {
  // it('matches snapshot');

  it('does not change the text', () => {
    const { advanceClockHalfSecond, expectedTextInitial } = setup();
    advanceClockHalfSecond();
    expect(screen.getByText(/pretend/)).toHaveTextContent(expectedTextInitial);
  });
});

describe('when a second passes', () => {
  // it('matches snapshot');

  it('changes the text', () => {
    const { advanceClockOneSecond, expectedTextOneSecond } = setup();
    advanceClockOneSecond();
    expect(screen.getByText(/pretend/)).toHaveTextContent(expectedTextOneSecond);
  });
});
