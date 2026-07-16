import type { Metadata } from "next";
import Link from "next/link";
import FixedValuesRange from "@/components/organisms/FixedValuesRange";
import { getFixedRangeValues } from "@/lib/data";

export const metadata: Metadata = {
  title: "Fixed values range — Range component",
};

const Exercise2Page = async () => {
  const { rangeValues } = await getFixedRangeValues();

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <main className="w-full max-w-md py-24">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <span aria-hidden="true">←</span>
          Back
        </Link>
        <h1 className="mt-6 text-xl font-bold tracking-wide text-black uppercase">
          Price
        </h1>
        <div className="mt-10">
          <FixedValuesRange rangeValues={rangeValues} />
        </div>
      </main>
    </div>
  );
};

export default Exercise2Page;
