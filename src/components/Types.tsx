type SignedDuration = Duration & {
  negative: boolean;
};

type BaseTenDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type FriendlyDuration = {
  negative: boolean;
  hourTens?: BaseTenDigit;
  hourOnes?: BaseTenDigit;
  minuteTens?: BaseTenDigit;
  minuteOnes?: BaseTenDigit;
  secondTens?: BaseTenDigit;
  secondOnes: BaseTenDigit; // the only required digit
};

export type { SignedDuration, BaseTenDigit, FriendlyDuration };
