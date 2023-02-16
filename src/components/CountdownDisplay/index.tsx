import { formatISO } from "date-fns";
import { useEffect, useState } from "react";

function getCurrentTime(): Date {
  return new Date();
}

type CountdownDisplayProps = {
  targetTime: Date // TODO rename
};

function CountdownDisplay(props: CountdownDisplayProps) {
  const [ currentTime, setCurrentTime ] = useState<Date>(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 200);

    return () => {
      clearInterval(interval);
    };
  });

  const currentDateText = formatISO(currentTime);
  const dateText = formatISO(props.targetTime);
  const text = `pretend this is a countdown from ${currentDateText} to ${dateText}`;
  return (
    <span>
      {text}
    </span>
  );
}

export default CountdownDisplay;
