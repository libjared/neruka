import renderer from 'react-test-renderer';
import { fireEvent, render, screen } from '@testing-library/react';
import DurationInput from '.';

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
