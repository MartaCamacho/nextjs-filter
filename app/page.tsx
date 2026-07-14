import Link from "next/link";

const exercises = [
  {
    href: "/exercise1",
    title: "Normal range",
    description: "Continuous range between a minimum and a maximum value.",
  },
  {
    href: "/exercise2",
    title: "Fixed values range",
    description: "Range constrained to a fixed set of allowed values.",
  },
] as const;

const Home = () => {
  return (
    <div className="flex flex-1 items-center justify-center bg-white px-6">
      <main className="w-full max-w-2xl py-24">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Range component
        </h1>
        <p className="mt-3 max-w-lg text-base text-neutral-600">
          Custom dual-handle range slider built for Mango&apos;s technical
          test, in two modes.
        </p>
        <ul className="mt-12 divide-y divide-neutral-200 border-y border-neutral-200">
          {exercises.map(({ href, title, description }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center justify-between gap-6 py-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                <span>
                  <span className="block text-sm font-bold tracking-wide text-black uppercase">
                    {title}
                  </span>
                  <span className="mt-1 block text-sm text-neutral-600">
                    {description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-black transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default Home;
