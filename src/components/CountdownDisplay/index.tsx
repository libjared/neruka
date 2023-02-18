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
  if (duration.days !== undefined) throw new Error("Expected days to be undefined.");
  if (duration.weeks !== undefined) throw new Error("Expected weeks to be undefined.");
  if (duration.months !== undefined) throw new Error("Expected months to be undefined.");
  if (duration.years !== undefined) throw new Error("Expected years to be undefined.");

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
