import Link from "next/link";
import NumberRange from "@/components/organisms/NumberRange";
import { getNumberRange } from "@/lib/data";

const Exercise1Page = async () => {
  const { min, max } = await getNumberRange();

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
          <NumberRange min={min} max={max} />
        </div>
      </main>
    </div>
  );
};

export default Exercise1Page;
