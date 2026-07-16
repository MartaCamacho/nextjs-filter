type RangeTrackProps = {
  minPercent: number;
  maxPercent: number;
};

const RangeTrack = ({ minPercent, maxPercent }: RangeTrackProps) => {
  return (
    <div className="relative h-0.5 w-full rounded-none bg-neutral-500">
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

export default RangeTrack;
