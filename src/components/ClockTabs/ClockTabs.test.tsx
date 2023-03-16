import { render } from "@testing-library/react";
import ClockTabs from ".";

it("renders", () => {
  const { asFragment } = render(<ClockTabs />);
  expect(asFragment()).toMatchSnapshot();
});
