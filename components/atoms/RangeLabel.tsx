import { formatCurrency } from "@/lib/format";

type RangeLabelProps = {
  caption: string;
  value: number;
  onClick?: () => void;
};

const RangeLabel = ({ caption, value, onClick }: RangeLabelProps) => {
  return (
    <div>
      <span className="block text-xs font-bold tracking-wide text-neutral-500 uppercase">
        {caption}
      </span>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="text-sm text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          {formatCurrency(value)}
        </button>
      ) : (
        <span className="text-sm text-black">{formatCurrency(value)}</span>
      )}
    </div>
  );
};

export default RangeLabel;
