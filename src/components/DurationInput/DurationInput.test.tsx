import renderer from 'react-test-renderer';
import DurationInput from '.';

it('renders', () => {
  const duration: Duration = { hours: 0, minutes: 15, seconds: 0 };
  const tree = renderer
    .create(<DurationInput duration={duration} onFinishEditing={() => {}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
