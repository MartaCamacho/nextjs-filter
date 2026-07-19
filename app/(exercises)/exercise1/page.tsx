import type { Metadata } from "next";
import NumberRange from "@/components/organisms/NumberRange";
import { getNumberRange } from "@/lib/data";

export const metadata: Metadata = {
  title: "Normal range — Range component",
};

const Exercise1Page = async () => {
  const { min, max } = await getNumberRange();

  return <NumberRange min={min} max={max} />;
};

export default Exercise1Page;
