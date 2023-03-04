import {
  fireEvent,
  render,
  RenderResult,
  screen,
  act,
} from "@testing-library/react";
import Timer from ".";

jest.useFakeTimers();

type SetupResult = RenderResult & {
  getTimer: () => HTMLElement;
  getTextbox: () => HTMLElement;
  clickStart: () => void;
  clickStop: () => void;
  clickCountdown: () => void;
  blurTextbox: () => void;
  waitOneSecond: () => void;
};

function setup(): SetupResult {
  const fakeCurrentTime = new Date(2023, 0, 1, 13, 0);
  jest.setSystemTime(fakeCurrentTime);
  const utils = render(<Timer />);
  const getTimer = () => {
    return screen.getByRole("timer");
  };
  const getTextbox = () => {
    return screen.getByRole("textbox");
  };
  const clickStart = () => {
    fireEvent.click(screen.getByDisplayValue("Start"));
  };
  const clickStop = () => {
    fireEvent.click(screen.getByDisplayValue("Stop"));
  };
  const clickCountdown = () => {
    fireEvent.click(getTimer());
  };
  const blurTextbox = () => {
    fireEvent.blur(getTextbox());
  };
  const waitOneSecond = () => {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  };

  return {
    ...utils,
    getTimer,
    getTextbox,
    clickStart,
    clickStop,
    clickCountdown,
    blurTextbox,
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

it("renders", () => {
  setup();
});

it("displays 15m00s", () => {
  const { getTimer } = setup();
  expect(getTimer().textContent).toBe("15m00s");
});

it("matches snapshot", () => {
  const { asFragment } = setup();
  expect(asFragment()).toMatchSnapshot();
});

it("starts timer", () => {
  const { getTimer } = setupStartedForOneSecond();
  expect(getTimer().textContent).toBe("14m59s");
});

it("stops timer", () => {
  const { getTimer } = setupStoppedAfterOneSecond();
  expect(getTimer().textContent).toBe("14m59s");
});

describe("when clicking on the countdown", () => {
  it("stops and edits", () => {
    const { clickCountdown, getTextbox } = setupStartedForOneSecond();
    clickCountdown();
    expect(getTextbox().textContent).toBe("00h14m59s");
  });

  it("finishes editing on blur", () => {
    const { clickCountdown, blurTextbox, getTimer } =
      setupStartedForOneSecond();
    clickCountdown();
    blurTextbox();
    expect(getTimer().textContent).toBe("14m59s");
  });

  it("does not force the edit view next time", () => {
    const {
      clickCountdown,
      blurTextbox,
      clickStart,
      waitOneSecond,
      clickStop,
      getTimer,
    } = setupStartedForOneSecond();
    clickCountdown();
    blurTextbox();
    clickStart();
    waitOneSecond();
    clickStop();
    expect(getTimer().textContent).toBe("14m58s");
  });
});
