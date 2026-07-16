import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FixedValuesRange from "./FixedValuesRange";

const rangeValues = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];

describe("FixedValuesRange", () => {
  test("renders labels at the first and last allowed values", () => {
    render(<FixedValuesRange rangeValues={rangeValues} />);

    expect(screen.getByText(/1,99/)).toBeInTheDocument();
    expect(screen.getByText(/70,99/)).toBeInTheDocument();
  });

  test("labels are static text, not clickable", () => {
    render(<FixedValuesRange rangeValues={rangeValues} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("stepping the min handle snaps to the next allowed value, not by 1", async () => {
    const user = userEvent.setup();
    render(<FixedValuesRange rangeValues={rangeValues} />);

    screen.getByRole("slider", { name: "Minimum price" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(
      screen.getByRole("slider", { name: "Minimum price" }),
    ).toHaveAttribute("aria-valuenow", "5.99");
  });

  test("handles cannot cross: stepping past the sibling stops at its value", async () => {
    const user = userEvent.setup();
    render(<FixedValuesRange rangeValues={rangeValues} />);

    const minHandle = screen.getByRole("slider", { name: "Minimum price" });
    minHandle.focus();
    await user.keyboard(
      "{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}",
    );

    expect(minHandle).toHaveAttribute("aria-valuenow", "70.99");
  });
});
