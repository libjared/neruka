import { intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";

function getCurrentTime(): Date {
  return new Date();
}

type CountdownDisplayProps = {
  targetTime: Date
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

  const duration = intervalToDuration({
    start: currentTime,
    end: props.targetTime
  });

  const dur = toFriendlyDuration(duration);

  let str = '';
  if (dur.hourTens !== undefined) { str += `${dur.hourTens}`; }
  if (dur.hourOnes !== undefined) { str += `${dur.hourOnes}h`; }
  if (dur.minuteTens !== undefined) { str += `${dur.minuteTens}`; }
  if (dur.minuteOnes !== undefined) { str += `${dur.minuteOnes}m`; }
  if (dur.secondTens !== undefined) { str += `${dur.secondTens}`; }
  str += `${dur.secondOnes}s`;

  const text = str;

  return (
    <span role="timer">
      {text}
    </span>
  );
}

type BaseTenDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type FriendlyDuration = {
  hourTens?: BaseTenDigit,
  hourOnes?: BaseTenDigit,
  minuteTens?: BaseTenDigit,
  minuteOnes?: BaseTenDigit,
  secondTens?: BaseTenDigit,
  secondOnes: BaseTenDigit, // the only required digit
};

// A whole number is any integer that is zero or positive.
function isWhole(num: number): boolean {
  return Number.isInteger(num) && num >= 0;
}

function toFriendlyDuration(duration: Duration): FriendlyDuration {
  if (duration.days !== undefined && duration.days !== 0) throw new Error("Expected days to be 0 or undefined.");
  if (duration.weeks !== undefined && duration.weeks !== 0) throw new Error("Expected weeks to be 0 or undefined.");
  if (duration.months !== undefined && duration.months !== 0) throw new Error("Expected months to be 0 or undefined.");
  if (duration.years !== undefined && duration.years !== 0) throw new Error("Expected years to be 0 or undefined.");

  if (duration.hours !== undefined && !isWhole(duration.hours)) throw new Error("Expected hours to be a whole number.");
  if (duration.minutes !== undefined && !isWhole(duration.minutes)) throw new Error("Expected minutes to be a whole number.");
  if (duration.seconds !== undefined && !isWhole(duration.seconds)) throw new Error("Expected seconds to be a whole number.");

  const digits: BaseTenDigit[] = new Array(6).fill('0');

  const asBaseTenDigit = (digit: string) => {
    if (digit.length === 1 && digit >= '0' && digit <= '9') {
      return digit as BaseTenDigit;
    }
    return '0'; // this should never happen
  };

  digits[0] = asBaseTenDigit(Math.floor((duration.hours || 0) / 10).toString());
  digits[1] = asBaseTenDigit(((duration.hours || 0) % 10).toString());
  digits[2] = asBaseTenDigit(Math.floor((duration.minutes || 0) / 10).toString());
  digits[3] = asBaseTenDigit(((duration.minutes || 0) % 10).toString());
  digits[4] = asBaseTenDigit(Math.floor((duration.seconds || 0) / 10).toString());
  digits[5] = asBaseTenDigit(((duration.seconds || 0) % 10).toString());

  const friendly: FriendlyDuration = {
    hourTens: digits[0],
    hourOnes: digits[1],
    minuteTens: digits[2],
    minuteOnes: digits[3],
    secondTens: digits[4],
    secondOnes: digits[5],
  };

  if (friendly.hourTens === '0') { delete friendly.hourTens; } else { return friendly; }
  if (friendly.hourOnes === '0') { delete friendly.hourOnes; } else { return friendly; }
  if (friendly.minuteTens === '0') { delete friendly.minuteTens; } else { return friendly; }
  if (friendly.minuteOnes === '0') { delete friendly.minuteOnes; } else { return friendly; }
  if (friendly.secondTens === '0') { delete friendly.secondTens; }
  return friendly;
}

export default CountdownDisplay;
export { toFriendlyDuration };

export type { FriendlyDuration };
