import { format } from "date-fns";

type CountdownDisplayProps = {
  time: Date
};

function CountdownDisplay(props: CountdownDisplayProps) {
  const dateText = format(props.time, 'HH:mm:ss.SSSXX');
  const text = `pretend this is a countdown to ${dateText}`;
  return (
    <span>
      {text}
    </span>
  );
}

export default CountdownDisplay;
