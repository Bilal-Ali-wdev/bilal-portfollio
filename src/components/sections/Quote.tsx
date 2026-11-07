import { quote } from "@/data/site";
import Reveal from "../Reveal";

export default function Quote() {
  return (
    <Reveal as="figure" className="quote" >
      <blockquote>
        “{quote.text} <span className="muted">{quote.muted}”</span>
      </blockquote>
      <figcaption className="mono">— {quote.author}</figcaption>
    </Reveal>
  );
}
