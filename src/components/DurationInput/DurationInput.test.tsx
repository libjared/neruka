import renderer from 'react-test-renderer';
import { fireEvent, render, RenderResult, screen } from '@testing-library/react';
import DurationInput, { padDigits, trimDigits } from '.';

const duration: Duration = { hours: 0, minutes: 15, seconds: 0 };
const noop = () => {};

type AllowedKey = '0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'Backspace'|'Enter';
type SetupResult = RenderResult & {
  focusOnTimer: () => void,
  typeKey: (key: AllowedKey) => void,
};

function setup(): SetupResult {
  const utils: RenderResult = render(<DurationInput duration={duration} onFinishEditing={noop} />);
  const focusOnTimer = () => {
    fireEvent.focus(screen.getByRole('timer'));
  };
  const typeKey = (key: AllowedKey) => {
    fireEvent.keyDown(screen.getByRole('textbox'), { key });
  };

  return {
    ...utils,
    focusOnTimer,
    typeKey,
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

describe('when editing', () => {
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
    render(<DurationInput duration={duration} onFinishEditing={noop} />);
    fireEvent.focus(screen.getByRole('timer'));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: '4' });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: '5' });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: '1' });
    expect(screen.getByRole('textbox').textContent).toBe('00h04m51s');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<DurationInput duration={duration} onFinishEditing={noop} />);
    fireEvent.focus(screen.getByRole('timer'));
    fireEvent.keyDown(screen.getByRole('textbox'), { key: '4' });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: '5' });
    fireEvent.keyDown(screen.getByRole('textbox'), { key: '1' });
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('after editing', () => {
  it('switches to the timer view', () => {
    render(<DurationInput duration={duration} onFinishEditing={noop} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();
    fireEvent.focus(screen.getByRole('timer'));
    fireEvent.blur(screen.getByRole('textbox'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<DurationInput duration={duration} onFinishEditing={noop} />);
    fireEvent.focus(screen.getByRole('timer'));
    fireEvent.blur(screen.getByRole('textbox'));
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('padDigits', () => {
  it('works', () => {
    expect(padDigits([1,5,0,0])).toEqual([0,0,1,5,0,0]);
  });
});

describe('trimDigits', () => {
  it('works', () => {
    expect(trimDigits([0,0,1,5,0,0])).toEqual([1,5,0,0]);
  });

  it('doesn\'t remove the last digit', () => {
    expect(trimDigits([0,0,0,0,0,0])).toEqual([0]);
  });
});
