import classNames from "classnames";

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

export default Digit;
