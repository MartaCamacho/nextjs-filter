import { useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import RangeLabel from "@/components/atoms/RangeLabel";
import { joinClassNames } from "@/lib/utils";

type EditableRangeLabelProps = {
  caption: string;
  value: number;
  onCommit: (value: number) => void;
};

const EditableRangeLabel = ({
  caption,
  value,
  onCommit,
}: EditableRangeLabelProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(String(value));

  const startEditing = () => {
    setDraftValue(String(value));
    setIsEditing(true);
  };

  const commit = () => {
    const parsed = Number(draftValue);
    if (draftValue.trim() !== "" && Number.isFinite(parsed)) {
      onCommit(parsed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commit();
    if (event.key === "Escape") setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <RangeLabel caption={caption} value={value} onClick={startEditing} />
    );
  }

  return (
    <div>
      <span className="block text-xs font-bold tracking-wide text-neutral-600 uppercase">
        {caption}
      </span>
      <input
        type="number"
        step="0.01"
        autoFocus
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        className={joinClassNames(
          "w-24 rounded-none border border-black px-2 py-1 text-sm text-black",
          "focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        )}
      />
    </div>
  );
};

export default EditableRangeLabel;
