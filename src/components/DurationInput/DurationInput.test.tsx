import { fireEvent, render, RenderResult, screen } from '@testing-library/react';
import DurationInput, { padDigits, trimDigits } from '.';

type AllowedKey = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'Backspace'|'Enter';
type SetupResult = RenderResult & {
  focusOnTimer: () => void,
  typeKey: (key: AllowedKey) => void,
  blurTextbox: () => void,
  handleFinishEditing: jest.Mock<void, [Duration, boolean]>,
};

function setup(): SetupResult {
  const duration: Duration = { hours: 0, minutes: 15, seconds: 0 };
  const handleFinishEditing = jest.fn<void, [Duration, boolean]>();
  const utils: RenderResult = render(<DurationInput duration={duration} onFinishEditing={handleFinishEditing} />);
  const focusOnTimer = () => {
    fireEvent.focus(screen.getByRole('timer'));
  };
  const typeKey = (key: AllowedKey) => {
    fireEvent.keyDown(screen.getByRole('textbox'), { key });
  };
  const blurTextbox = () => {
    fireEvent.blur(screen.getByRole('textbox'));
  };

  return {
    ...utils,
    handleFinishEditing,
    focusOnTimer,
    typeKey,
    blurTextbox,
  };
}

function setupEditingCase() {
  const utils = setup();
  utils.focusOnTimer();
  return utils;
}

function setupEnteredTimeCase() {
  const utils = setup();
  utils.focusOnTimer();
  utils.typeKey('4');
  utils.typeKey('5');
  utils.typeKey('1');
  return utils;
}

function setupAfterEditingCase() {
  const utils = setup();
  utils.focusOnTimer();
  utils.typeKey('4');
  utils.typeKey('5');
  utils.typeKey('1');
  utils.blurTextbox();
  return utils;
}

function setupStartImmediatelyCase() {
  const utils = setup();
  utils.focusOnTimer();
  utils.typeKey('4');
  utils.typeKey('5');
  utils.typeKey('1');
  utils.typeKey('Enter');
  return utils;
}

describe('initially', () => {
  it('is in the timer view', () => {
    setup();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = setup();
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('when focusing', () => {
  it('switches to the editing view', () => {
    setupEditingCase();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = setupEditingCase();
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('when typing in a time', () => {
  it('sets the wip text', () => {
    setupEnteredTimeCase();
    expect(screen.getByRole('textbox').textContent).toBe('00h04m51s');
  });

  it('matches snapshot', () => {
    const { asFragment } = setupEnteredTimeCase();
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('when blurring', () => {
  it('switches to the timer view', () => {
    setupAfterEditingCase();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('calls onFinishEditing', () => {
    const { handleFinishEditing } = setupAfterEditingCase();
    const expectedDuration: Duration = { hours: 0, minutes: 4, seconds: 51 };
    expect(handleFinishEditing).toHaveBeenCalledTimes(1);
    expect(handleFinishEditing).toHaveBeenCalledWith(expectedDuration, false);
  });

  it('matches snapshot', () => {
    const { asFragment } = setupAfterEditingCase();
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('when hitting enter in edit mode', () => {
  it('switches to the timer view', () => {
    setupStartImmediatelyCase();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('calls onFinishEditing with startImmediately', () => {
    const { handleFinishEditing } = setupStartImmediatelyCase();
    const expectedDuration: Duration = { hours: 0, minutes: 4, seconds: 51 };
    expect(handleFinishEditing).toHaveBeenCalledTimes(1);
    expect(handleFinishEditing).toHaveBeenCalledWith(expectedDuration, true);
  });

  it('matches snapshot', () => {
    const { asFragment } = setupStartImmediatelyCase();
    expect(asFragment()).toMatchSnapshot();
  });
});

test('padDigits works', () => {
  expect(padDigits([1,5,0,0])).toEqual([0,0,1,5,0,0]);
});

describe('trimDigits', () => {
  it('works', () => {
    expect(trimDigits([0,0,1,5,0,0])).toEqual([1,5,0,0]);
  });

  it('doesn\'t remove the last digit', () => {
    expect(trimDigits([0,0,0,0,0,0])).toEqual([0]);
  });
});
