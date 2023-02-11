import renderer from 'react-test-renderer';
import { fireEvent, render, screen } from '@testing-library/react';
import DurationInput, { padDigits, trimDigits } from '.';

const duration: Duration = { hours: 0, minutes: 15, seconds: 0 };
const noop = () => {};

it('matches snapshot', () => {
  const tree = renderer
    .create(<DurationInput duration={duration} onFinishEditing={noop} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

describe('when the timer is focused', () => {
  it('switches to editing', () => {
    render(<DurationInput duration={duration} onFinishEditing={noop} />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('timer')).toBeInTheDocument();
    fireEvent.focus(screen.getByRole('timer'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<DurationInput duration={duration} onFinishEditing={noop} />);
    fireEvent.focus(screen.getByRole('timer'));
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('when the timer is blurred', () => {
  it('renders', () => {
    render(<DurationInput duration={duration} onFinishEditing={noop} />);
    fireEvent.focus(screen.getByRole('timer'));
    fireEvent.blur(screen.getByRole('textbox'));
  });

  xit('matches snapshot', () => {
    const { asFragment } = render(<DurationInput duration={duration} onFinishEditing={noop} />);
    fireEvent.focus(screen.getByRole('timer'));
    fireEvent.blur(screen.getByRole('textbox'));
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('when editing', () => {
  describe('when typing 4', () => {
    it('sets the timer text to 4 seconds', () => {
      render(<DurationInput duration={duration} onFinishEditing={noop} />);
      fireEvent.focus(screen.getByRole('timer'));
      fireEvent.keyDown(screen.getByRole('textbox'), { key: '4' });
      expect(screen.getByRole('textbox').textContent).toBe('00h00m04s');
    });

    xit('matches snapshot', () => {});
  });

  xit('matches snapshot', () => {});
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
