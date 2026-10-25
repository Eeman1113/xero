import { toLines } from "@/lib/story";

type Props = { text: string; className?: string };

/** Long-form copy as reveal-lines. useScrollScene().prompter() scrolls it. */
export default function Prompter({ text, className }: Props) {
  const lines = toLines(text);
  return (
    <div className={`prompter ${className ?? ""}`}>
      <div className="p-col">
        {lines.map((l, i) => (
          <p className="p-line" key={i}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}
