import NumberRange from "@/components/organisms/NumberRange";
import { getNumberRange } from "@/lib/data";

const Exercise1Page = async () => {
  const { min, max } = await getNumberRange();

  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <main className="w-full max-w-md py-24">
        <h1 className="text-xl font-bold tracking-wide text-black uppercase">
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
