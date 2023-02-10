import classNames from 'classnames';
import { useState } from 'react';
import './DurationInput.css';

function renderDigits(hhmmss: number[], lightLength: number | null): JSX.Element[] {
  const elements: JSX.Element[] = [];
  const lightLen = lightLength || 9999;
  for (let i = 0; i < hhmmss.length; i++) {
    const alignedIdx = i + (6 - hhmmss.length);
    const isLit = 6 - i <= lightLen;
    elements.push(<Digit key={alignedIdx} value={hhmmss[i]} isLit={isLit} />);
    if (alignedIdx === 1) {
      elements.push(<Label key="h" label="h" isLit={isLit} />);
    }
    if (alignedIdx === 3) {
      elements.push(<Label key="m" label="m" isLit={isLit} />);
    }
    if (alignedIdx === 5) {
      elements.push(<Label key="s" label="s" isLit={isLit} />);
    }
  }
  return elements;
}

// returns a new left-padded array of digits.
function digitsFromDuration(duration: Duration): number[] {
  return [
    Math.floor((duration.hours || 0) / 10),
    Math.floor((duration.hours || 0) % 10),
    Math.floor((duration.minutes || 0) / 10),
    Math.floor((duration.minutes || 0) % 10),
    Math.floor((duration.seconds || 0) / 10),
    Math.floor((duration.seconds || 0) % 10),
  ];
}

// remove left-padded zeroes from an array of 6 digits.
// will always leave at least one element, even if it's also a zero.
// returns a new array.
function trimDigits(digits: number[]): number[] {
  if (digits.length !== 6) throw new Error('Expected digits to have a length of 6.');

  const newDigits = [ ...digits ];
  for (let i = 0; i < newDigits.length - 1; i++) {
    if (newDigits[i] === 0) {
      newDigits.shift();
      i--;
    } else {
      break;
    }
  }
  return newDigits;
}

// prepend zeroes until the array has a length of 6.
// returns a new array.
function padDigits(digits: number[]) : number[] {
  if (digits.length > 6) throw new Error('Expected digits to be fewer or equal to 6.');

  return [ ...(new Array(6).fill(0)), ...digits ].reverse().slice(0, 6);
}

type DurationInputProps = {
  duration: Duration,
  onFinishEditing: (newDuration: Duration, immediatelyStart: boolean) => void
};

function DurationInput({ duration, onFinishEditing }: DurationInputProps) {
  const [ isEditing, setEditing ] = useState<boolean>(false);

  // hhmmss, right-aligned, length is [0,6], no left-padding with zeroes.
  // represents the in-progress inputting of a duration.
  // only valid when isEditing true; otherwise null.
  const [ wipDigits, setWipDigits ] = useState<number[] | null>(null);

  // how many wipDigits from the right should be lit up?
  // the h/m/s labels are also lit, but implicitly (ie they don't contribute to the count).
  // only valid when isEditing true, otherwise null.
  const [ lightLength, setLightLength ] = useState<number | null>(null);

  const onFocus: React.FocusEventHandler<HTMLDivElement> = () => {
    if (isEditing) throw new Error('Expected isEditing to be false.');
    if (wipDigits !== null) throw new Error('Expected wipDigits to be null.');

    // on edit, every digit is present, but unlit, like a placeholder
    setLightLength(0);
    setWipDigits(digitsFromDuration(duration));
    setEditing(true);
  };
  const onBlur: React.FocusEventHandler<HTMLDivElement> = () => {
    if (!isEditing) throw new Error('Expected isEditing to be true.');
    if (wipDigits === null) throw new Error('Expected wipDigits to be non-null.');

    const ssmmhh = padDigits(wipDigits);
    const newDuration: Duration = {
      hours: ssmmhh[5] * 10 + ssmmhh[4],
      minutes: ssmmhh[3] * 10 + ssmmhh[2],
      seconds: ssmmhh[1] * 10 + ssmmhh[0]
    };

    // TODO: run digits through a duration normalizer
    // 99m => 1h39m
    // 0m10s => 10s
    // 01s => 1s
    // wow date-fns is half-baked. I gotta normalize durations myself?
    onFinishEditing(newDuration, false);
    setEditing(false);
  };
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) => {
    if (!isEditing) throw new Error('Expected isEditing to be true.');
    if (wipDigits === null) throw new Error('Expected wipDigits to be non-null.');
    if (lightLength === null) throw new Error('Expected lightLength to be non-null.');

    if (ev.key === 'Backspace') {
      if (wipDigits.length <= 0) return;
      if (lightLength === 0) {
        // backspace when all digits are placeholder sets it to 00h00m00s
        setWipDigits([]);
      } else {
        const newDigits = [ ...wipDigits ];
        newDigits.pop();
        setWipDigits(newDigits);
        setLightLength(lightLength - 1);
      }
    } else if (ev.key === 'Enter') {
      ev.currentTarget.blur();
    } else if ('0' <= ev.key && ev.key <= '9') {
      if (wipDigits.length >= 6) return;

      const digit = Number(ev.key);
      console.assert(0 <= digit && digit <= 9);

      let initial: Array<number>;
      if (lightLength === 0) {
        initial = []; // discard the existing placeholder digits
      } else {
        initial = [ ...wipDigits ]; // we're in the process of typing digits
      }

      setWipDigits([ ...initial, digit ]);
      setLightLength(lightLength + 1);
    }
  };

  const children = (() => {
    let hhmmss: number[];

    if (isEditing) {
      if (wipDigits === null) throw new Error('Expected wipDigits to be non-null.');
      if (lightLength === null) throw new Error('Expected lightLength to be non-null.');

      hhmmss = padDigits(wipDigits);
    } else {
      // not editing
      if (wipDigits !== null) throw new Error('Expected wipDigits to be null.');
      if (lightLength !== null) throw new Error('Expected lightLength to be null.');

      hhmmss = trimDigits(digitsFromDuration(duration));
    }

    return renderDigits(hhmmss, lightLength);
  })();

  const innerClass = classNames("DurationInput-area", {
    editing: isEditing
  });

  return (
    <div
      className="DurationInput-main"
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role={isEditing ? "textbox" : "timer"}
    >
      <div className={innerClass}>
        {children}
      </div>
    </div>
  );
}

type DigitProps = {
  value: number,
  isLit: boolean
};

function Digit({ value, isLit }: DigitProps) {
  const classes = classNames("Digit", {
    lit: isLit
  });
  return (
    <span className={classes}>
      {value.toString().substring(0, 1)}
    </span>
  );
}

type LabelProps = {
  label: "h" | "m" | "s"
  isLit: boolean
};

function Label({ label, isLit }: LabelProps) {
  const classes = classNames("Label", {
    hours: label === "h",
    minutes: label === "m",
    seconds: label === "s",
    lit: isLit
  });
  return (
    <span className={classes}>{label}</span>
  );
}

export default DurationInput;
