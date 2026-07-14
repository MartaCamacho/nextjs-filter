type SliderTrackProps = {
  minPercent: number;
  maxPercent: number;
};

const SliderTrack = ({ minPercent, maxPercent }: SliderTrackProps) => {
  return (
    <div className="relative h-0.5 w-full rounded-none bg-neutral-300">
      <div
        className="absolute h-0.5 bg-black"
        style={{
          left: `${minPercent}%`,
          width: `${maxPercent - minPercent}%`,
        }}
      />
    </div>
  );
};

export default SliderTrack;
