import type { Metadata } from "next";
import FixedValuesRange from "@/components/organisms/FixedValuesRange";
import { getFixedRangeValues } from "@/lib/data";

export const metadata: Metadata = {
  title: "Fixed values range — Range component",
};

const Exercise2Page = async () => {
  const { rangeValues } = await getFixedRangeValues();

  return <FixedValuesRange rangeValues={rangeValues} />;
};

export default Exercise2Page;
