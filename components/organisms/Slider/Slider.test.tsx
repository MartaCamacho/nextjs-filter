import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createContinuousAdapter, createDiscreteAdapter } from "@/lib/slider/adapters";
import type { RangeAdapter, SelectedRange } from "@/types/range";
import Slider from "./Slider";

const formatValue = (value: number) => `${value}`;

type TestSliderProps = {
  adapter: RangeAdapter;
  initialValue: SelectedRange;
};

const TestSlider = ({ adapter, initialValue }: TestSliderProps) => {
  const [value, setValue] = useState(initialValue);
  return (
    <Slider
      adapter={adapter}
      value={value}
      onChange={setValue}
      minLabel="Minimum"
      maxLabel="Maximum"
      formatValue={formatValue}
    />
  );
};

const mockTrackWidth = (element: HTMLElement, width: number) => {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    left: 0,
    right: width,
    width,
    top: 0,
    bottom: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
};

describe("Slider", () => {
  test("renders both handles with correct initial ARIA attributes", () => {
    const adapter = createContinuousAdapter(1, 100);
    render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 20, maxValue: 80 }}
      />,
    );

    const minHandle = screen.getByRole("slider", { name: "Minimum" });
    const maxHandle = screen.getByRole("slider", { name: "Maximum" });

    expect(minHandle).toHaveAttribute("aria-valuenow", "20");
    expect(minHandle).toHaveAttribute("aria-valuemin", "1");
    expect(minHandle).toHaveAttribute("aria-valuemax", "80");
    expect(minHandle).toHaveAttribute("aria-valuetext", "20");

    expect(maxHandle).toHaveAttribute("aria-valuenow", "80");
    expect(maxHandle).toHaveAttribute("aria-valuemin", "20");
    expect(maxHandle).toHaveAttribute("aria-valuemax", "100");
  });

  test("ArrowRight increases the min handle by one step", async () => {
    const user = userEvent.setup();
    const adapter = createContinuousAdapter(1, 100);
    render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 20, maxValue: 80 }}
      />,
    );

    const minHandle = screen.getByRole("slider", { name: "Minimum" });
    minHandle.focus();
    await user.keyboard("{ArrowRight}");

    expect(minHandle).toHaveAttribute("aria-valuenow", "21");
  });

  test("ArrowLeft decreases the max handle by one step", async () => {
    const user = userEvent.setup();
    const adapter = createContinuousAdapter(1, 100);
    render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 20, maxValue: 80 }}
      />,
    );

    const maxHandle = screen.getByRole("slider", { name: "Maximum" });
    maxHandle.focus();
    await user.keyboard("{ArrowLeft}");

    expect(maxHandle).toHaveAttribute("aria-valuenow", "79");
  });

  test("End on the min handle clamps to the sibling's value, not the domain max", async () => {
    const user = userEvent.setup();
    const adapter = createContinuousAdapter(1, 100);
    render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 20, maxValue: 80 }}
      />,
    );

    const minHandle = screen.getByRole("slider", { name: "Minimum" });
    minHandle.focus();
    await user.keyboard("{End}");

    expect(minHandle).toHaveAttribute("aria-valuenow", "80");
  });

  test("Home on the max handle clamps to the sibling's value, not the domain min", async () => {
    const user = userEvent.setup();
    const adapter = createContinuousAdapter(1, 100);
    render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 20, maxValue: 80 }}
      />,
    );

    const maxHandle = screen.getByRole("slider", { name: "Maximum" });
    maxHandle.focus();
    await user.keyboard("{Home}");

    expect(maxHandle).toHaveAttribute("aria-valuenow", "20");
  });

  test("handles cannot cross: repeated ArrowRight on the min handle stops at the sibling", async () => {
    const user = userEvent.setup();
    const adapter = createContinuousAdapter(1, 100);
    render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 78, maxValue: 80 }}
      />,
    );

    const minHandle = screen.getByRole("slider", { name: "Minimum" });
    minHandle.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}{ArrowRight}");

    expect(minHandle).toHaveAttribute("aria-valuenow", "80");
  });

  test("focus stays on the handle across repeated key presses", async () => {
    const user = userEvent.setup();
    const adapter = createContinuousAdapter(1, 100);
    render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 20, maxValue: 80 }}
      />,
    );

    const minHandle = screen.getByRole("slider", { name: "Minimum" });
    minHandle.focus();
    await user.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");

    expect(minHandle).toHaveFocus();
  });

  test("ArrowRight prevents the default scroll behavior", () => {
    const adapter = createContinuousAdapter(1, 100);
    render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 20, maxValue: 80 }}
      />,
    );

    const minHandle = screen.getByRole("slider", { name: "Minimum" });
    const wasNotCancelled = fireEvent.keyDown(minHandle, {
      key: "ArrowRight",
    });

    expect(wasNotCancelled).toBe(false);
  });

  test("snaps to the nearest allowed value in discrete mode", async () => {
    const user = userEvent.setup();
    const adapter = createDiscreteAdapter([
      1.99, 5.99, 10.99, 30.99, 50.99, 70.99,
    ]);
    render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 1.99, maxValue: 70.99 }}
      />,
    );

    const minHandle = screen.getByRole("slider", { name: "Minimum" });
    minHandle.focus();
    await user.keyboard("{ArrowRight}");

    expect(minHandle).toHaveAttribute("aria-valuenow", "5.99");
  });

  test("discrete handles cannot land between allowed values when dragged", () => {
    const adapter = createDiscreteAdapter([
      1.99, 5.99, 10.99, 30.99, 50.99, 70.99,
    ]);
    const { container } = render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 1.99, maxValue: 70.99 }}
      />,
    );

    const trackWrapper = container.firstChild as HTMLElement;
    mockTrackWidth(trackWrapper, 200);

    const minHandle = screen.getByRole("slider", { name: "Minimum" });
    fireEvent.pointerDown(minHandle, { clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 122, pointerId: 1 });
    fireEvent.pointerUp(window, { pointerId: 1 });

    expect(minHandle.getAttribute("aria-valuenow")).toBe("30.99");
  });

  test("dragging the min handle updates its value based on pointer position", () => {
    const adapter = createContinuousAdapter(1, 100);
    const { container } = render(
      <TestSlider
        adapter={adapter}
        initialValue={{ minValue: 20, maxValue: 80 }}
      />,
    );

    const trackWrapper = container.firstChild as HTMLElement;
    mockTrackWidth(trackWrapper, 200);

    const minHandle = screen.getByRole("slider", { name: "Minimum" });
    fireEvent.pointerDown(minHandle, { clientX: 40, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 100, pointerId: 1 });
    fireEvent.pointerUp(window, { pointerId: 1 });

    expect(minHandle.getAttribute("aria-valuenow")).toBe("51");
  });
});
