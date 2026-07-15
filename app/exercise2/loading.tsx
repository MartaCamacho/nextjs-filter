const Loading = () => {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <main className="w-full max-w-md py-24">
        <div className="h-5 w-12 animate-pulse bg-neutral-100" />
        <div className="mt-6 h-6 w-24 animate-pulse bg-neutral-100" />
        <div className="mt-10 h-11 w-full animate-pulse bg-neutral-100" />
      </main>
    </div>
  );
};

export default Loading;
