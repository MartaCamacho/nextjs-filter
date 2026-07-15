import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NumberRange from "./NumberRange";

describe("NumberRange", () => {
  test("renders labels with the initial min/max values", () => {
    render(<NumberRange min={1} max={100} />);

    expect(screen.getByRole("button", { name: /1,00/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /100,00/ }),
    ).toBeInTheDocument();
  });

  test("editing the min label moves the min handle", async () => {
    const user = userEvent.setup();
    render(<NumberRange min={1} max={100} />);

    await user.click(screen.getByRole("button", { name: /1,00/ }));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "40{Enter}");

    expect(
      screen.getByRole("slider", { name: "Minimum price" }),
    ).toHaveAttribute("aria-valuenow", "40");
  });

  test("dragging the min handle by keyboard updates the min label", async () => {
    const user = userEvent.setup();
    render(<NumberRange min={1} max={100} />);

    screen.getByRole("slider", { name: "Minimum price" }).focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");

    expect(screen.getByRole("button", { name: /4,00/ })).toBeInTheDocument();
  });

  test("editing a label cannot push it past the sibling handle", async () => {
    const user = userEvent.setup();
    render(<NumberRange min={1} max={100} />);

    await user.click(screen.getByRole("button", { name: /1,00/ }));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "500{Enter}");

    expect(
      screen.getByRole("slider", { name: "Minimum price" }),
    ).toHaveAttribute("aria-valuenow", "100");
  });

  test("both labels are clickable/editable", () => {
    render(<NumberRange min={1} max={100} />);

    expect(screen.getByRole("button", { name: /1,00/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /100,00/ })).toBeEnabled();
  });
});
