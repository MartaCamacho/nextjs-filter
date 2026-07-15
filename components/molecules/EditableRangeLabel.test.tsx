import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditableRangeLabel from "./EditableRangeLabel";

describe("EditableRangeLabel", () => {
  test("renders the formatted value as a button", () => {
    render(
      <EditableRangeLabel caption="From" value={5.99} onCommit={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: /5,99/ }),
    ).toBeInTheDocument();
  });

  test("clicking the button switches to an editable input", async () => {
    const user = userEvent.setup();
    render(
      <EditableRangeLabel caption="From" value={5.99} onCommit={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: /5,99/ }));

    expect(screen.getByRole("spinbutton")).toHaveValue(5.99);
  });

  test("pressing Enter commits the typed value", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(
      <EditableRangeLabel caption="From" value={5.99} onCommit={onCommit} />,
    );

    await user.click(screen.getByRole("button", { name: /5,99/ }));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "42{Enter}");

    expect(onCommit).toHaveBeenCalledWith(42);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("blurring the input commits the typed value", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(
      <EditableRangeLabel caption="From" value={5.99} onCommit={onCommit} />,
    );

    await user.click(screen.getByRole("button", { name: /5,99/ }));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "42");
    await user.tab();

    expect(onCommit).toHaveBeenCalledWith(42);
  });

  test("pressing Escape cancels without committing", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(
      <EditableRangeLabel caption="From" value={5.99} onCommit={onCommit} />,
    );

    await user.click(screen.getByRole("button", { name: /5,99/ }));
    await user.clear(screen.getByRole("spinbutton"));
    await user.type(screen.getByRole("spinbutton"), "42{Escape}");

    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /5,99/ })).toBeInTheDocument();
  });

  test("committing an empty input does not call onCommit", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(
      <EditableRangeLabel caption="From" value={5.99} onCommit={onCommit} />,
    );

    await user.click(screen.getByRole("button", { name: /5,99/ }));
    await user.clear(screen.getByRole("spinbutton"));
    await user.keyboard("{Enter}");

    expect(onCommit).not.toHaveBeenCalled();
  });
});
