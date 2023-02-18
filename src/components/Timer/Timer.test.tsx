import { fireEvent, render, RenderResult, screen, act } from '@testing-library/react';
import Timer from '.';

jest.useFakeTimers();

type SetupResult = RenderResult & {
  getTimer: () => HTMLElement,
  clickStart: () => void,
  clickStop: () => void,
  waitOneSecond: () => void,
};

function setup(): SetupResult {
  const fakeCurrentTime = new Date(2023, 0, 1, 13, 0);
  jest.setSystemTime(fakeCurrentTime);
  const utils = render(<Timer />);
  const clickStart = () => {
    fireEvent.click(screen.getByDisplayValue('Start'));
  };
  const clickStop = () => {
    fireEvent.click(screen.getByDisplayValue('Stop'));
  };
  const getTimer = () => {
    return screen.getByRole('timer');
  };
  const waitOneSecond = () => {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  };

  return {
    ...utils,
    getTimer,
    clickStart,
    clickStop,
    waitOneSecond,
  };
}

function setupStartedForOneSecond(): SetupResult {
  const utils = setup();
  utils.clickStart();
  utils.waitOneSecond();
  return utils;
}

function setupStoppedAfterOneSecond(): SetupResult {
  const utils = setup();
  utils.clickStart();
  utils.waitOneSecond();
  utils.clickStop();
  utils.waitOneSecond();
  return utils;
}

it('renders', () => {
  setup();
});

it('displays 15m00s', () => {
  const { getTimer } = setup();
  expect(getTimer()).toHaveTextContent('15m00s');
});

it('matches snapshot', () => {
  const { asFragment } = setup();
  expect(asFragment()).toMatchSnapshot();
});

it('starts timer', () => {
  const { getTimer } = setupStartedForOneSecond();
  expect(getTimer()).toHaveTextContent('14m59s');
});

it('stops timer', () => {
  const { getTimer } = setupStoppedAfterOneSecond();
  expect(getTimer()).toHaveTextContent('14m59s');
});
