import classNames from "classnames";

type DigitProps = {
  value: number;
  isLit: boolean;
};

function Digit({ value, isLit }: DigitProps) {
  const classes = classNames("Digit", {
    lit: isLit,
  });
  const digitChar = value.toString().substring(0, 1);
  return <span className={classes}>{digitChar}</span>;
}

export default Digit;
