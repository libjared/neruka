import { fireEvent, render, RenderResult, screen, act } from '@testing-library/react';
import Timer from '.';

jest.useFakeTimers();

type SetupResult = RenderResult & {
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
  const waitOneSecond = () => {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  };

  return {
    ...utils,
    clickStart,
    clickStop,
    waitOneSecond,
  };
}

test('renders', () => {
  setup();
});

test('displays 15m00s', () => {
  const { baseElement } = setup();
  expect(baseElement).toHaveTextContent('15m00s');
});

test('matches snapshot', () => {
  const { asFragment } = setup();
  expect(asFragment()).toMatchSnapshot();
});

test('starts timer', () => {
  const { clickStart, waitOneSecond, baseElement } = setup();
  clickStart();
  waitOneSecond();
  expect(baseElement).toHaveTextContent('14m59s');
});

test('stops timer', () => {
  const { clickStart, waitOneSecond, clickStop, baseElement } = setup();
  clickStart();
  waitOneSecond();
  clickStop();
  waitOneSecond();
  waitOneSecond();
  expect(baseElement).toHaveTextContent('14m59s');
});
