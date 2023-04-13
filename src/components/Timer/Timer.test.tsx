import {
  fireEvent,
  render,
  RenderResult,
  screen,
  act,
} from "@testing-library/react";
import Timer from ".";

jest.useFakeTimers();

type AllowedKey =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "Backspace"
  | "Enter";
type SetupResult = RenderResult & {
  getTimer: () => HTMLElement;
  getTextbox: () => HTMLElement;
  clickStart: () => void;
  clickStop: () => void;
  clickReset: () => void;
  clickCountdown: () => void;
  focusTimer: () => void;
  blurTextbox: () => void;
  typeKey: (key: AllowedKey) => void;
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
  const clickReset = () => {
    fireEvent.click(screen.getByDisplayValue("Reset"));
  };
  const clickCountdown = () => {
    fireEvent.click(getTimer());
  };
  const focusTimer = () => {
    fireEvent.focus(getTimer());
  };
  const blurTextbox = () => {
    fireEvent.blur(getTextbox());
  };
  const typeKey = (key: AllowedKey) => {
    fireEvent.keyDown(getTextbox(), { key });
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
    clickReset,
    clickCountdown,
    focusTimer,
    blurTextbox,
    typeKey,
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

it("resumes from paused state, after clicking Start", () => {
  const { clickStart, waitOneSecond, getTimer } = setupStoppedAfterOneSecond();
  clickStart();
  waitOneSecond();
  expect(getTimer().textContent).toBe("14m58s");
});

describe("when clicking reset while running", () => {
  it("resets to the original duration", () => {
    const { getTimer, clickReset } = setupStartedForOneSecond();
    expect(getTimer().textContent).toBe("14m59s");
    clickReset();
    expect(getTimer().textContent).toBe("15m00s");
  });
});

describe("when clicking reset while paused", () => {
  it("resets to the original duration", () => {
    const { getTimer, clickReset } = setupStoppedAfterOneSecond();
    expect(getTimer().textContent).toBe("14m59s");
    clickReset();
    expect(getTimer().textContent).toBe("15m00s");
  });
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

  it("starts immediately on Enter", () => {
    const { focusTimer, typeKey, waitOneSecond, getTimer } = setup();
    focusTimer();
    typeKey("5");
    typeKey("8");
    typeKey("Enter");
    expect(getTimer().textContent).toBe("58s");
    waitOneSecond();
    expect(getTimer().textContent).toBe("57s");
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

describe("when setting duration from time", () => {
  // TODO
});
