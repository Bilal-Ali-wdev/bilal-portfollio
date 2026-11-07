import { quote } from "@/data/site";
import Split from "../Split";

export default function Quote() {
  return (
    <figure className="quote">
      <blockquote data-anim="fill">
        <Split text={`“${quote.text}`} muted={`${quote.muted}”`} />
      </blockquote>
      <figcaption className="mono">— {quote.author}</figcaption>
    </figure>
  );
}
