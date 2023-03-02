import { add, intervalToDuration, toDate } from "date-fns";
import { useEffect, useState } from "react";

function getCurrentTime(): Date {
  return new Date();
}

type CountdownDisplayProps = {
  targetTime: Date,
  onClick: () => void,
};

function CountdownDisplay({ targetTime, onClick }: CountdownDisplayProps) {
  const [ currentTime, setCurrentTime ] = useState<Date>(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 200);

    return () => {
      clearInterval(interval);
    };
  });

  const handleClick = () => {
    onClick();
  };

  const duration = intervalToDurationCeiling({
    start: currentTime,
    end: targetTime
  });

  const dur = toFriendlyDuration(duration);

  let str = '';
  if (dur.negative) { str += '-'; }
  if (dur.hourTens !== undefined) { str += `${dur.hourTens}`; }
  if (dur.hourOnes !== undefined) { str += `${dur.hourOnes}h`; }
  if (dur.minuteTens !== undefined) { str += `${dur.minuteTens}`; }
  if (dur.minuteOnes !== undefined) { str += `${dur.minuteOnes}m`; }
  if (dur.secondTens !== undefined) { str += `${dur.secondTens}`; }
  str += `${dur.secondOnes}s`;

  const text = str;

  return (
    <span role="timer" onClick={handleClick}>
      {text}
    </span>
  );
}

type BaseTenDigit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

type FriendlyDuration = {
  negative: boolean,
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

function toFriendlyDuration(duration: SignedDuration): FriendlyDuration {
  if (duration.days !== undefined && duration.days !== 0) throw new Error("Expected days to be 0 or undefined.");
  if (duration.weeks !== undefined && duration.weeks !== 0) throw new Error("Expected weeks to be 0 or undefined.");
  if (duration.months !== undefined && duration.months !== 0) throw new Error("Expected months to be 0 or undefined.");
  if (duration.years !== undefined && duration.years !== 0) throw new Error("Expected years to be 0 or undefined.");

  if (duration.hours !== undefined && !isWhole(duration.hours)) throw new Error("Expected hours to be a whole number.");
  if (duration.minutes !== undefined && !isWhole(duration.minutes)) throw new Error("Expected minutes to be a whole number.");
  if (duration.seconds !== undefined && !isWhole(duration.seconds)) throw new Error("Expected seconds to be a whole number.");

  if (
    (duration.hours === undefined || duration.hours === 0) &&
    (duration.minutes === undefined || duration.minutes === 0) &&
    (duration.seconds === undefined || duration.seconds === 0) &&
    duration.negative
  ) {
    throw new Error("Expected duration not to be negative 0.");
  }

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
    negative: duration.negative,
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

type SignedDuration = Duration & {
  negative: boolean,
};

function intervalToDurationCeiling(interval: Interval): SignedDuration {
  const start = toDate(interval.start);
  const end = toDate(interval.end);
  const startTime = start.getTime();
  const endTime = end.getTime();

  // | s after | display |
  // |---------|---------|
  // |  -1.001 |      2s |
  // |  -1.000 |      1s |
  // |  -0.999 |      1s |
  // |  -0.001 |      1s |
  // |   0.000 |      0s | <-- ring, ring!
  // |   0.001 |      0s |
  // |   0.999 |      0s |
  // |   1.000 |     -1s |
  // |   1.001 |     -1s |

  // round up, by pushing the end into the future by 1 second.
  const shouldRoundUp = (
    startTime % 1000 !== endTime % 1000 && // only when the difference is inexact
    endTime > startTime // only round when we're still before the target (because intervalToDuration() calls abs())
  );
  const fixedEnd = add(end, { seconds: shouldRoundUp ? 1 : 0 });

  const unsignedDuration = intervalToDuration({ start, end: fixedEnd });
  const showNegative = fixedEnd.getTime() - startTime <= -1000;

  return {
    ...unsignedDuration,
    negative: showNegative,
  };
}

export default CountdownDisplay;
export { toFriendlyDuration, intervalToDurationCeiling };

export type { FriendlyDuration };
