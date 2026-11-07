import { Fragment } from "react";

type Props = {
  text: string;
  /** Trailing text rendered in the muted grey. */
  muted?: string;
  /** "words" masks each word; "chars" masks each letter. */
  mode?: "words" | "chars";
};

/**
 * Server-rendered text split into masked spans so GSAP can animate words or
 * letters (see ScrollFX). Screen readers get the plain sentence.
 */
export default function Split({ text, muted, mode = "words" }: Props) {
  const render = (str: string, cls?: string, offset = 0) =>
    str.split(" ").map((word, wi) => (
      <Fragment key={`${offset}-${wi}`}>
        {wi > 0 && " "}
        <span className={`split-w${cls ? ` ${cls}` : ""}`}>
          {mode === "chars" ? (
            Array.from(word).map((c, ci) => (
              <span key={ci} className="split-i">
                {c}
              </span>
            ))
          ) : (
            <span className="split-i">{word}</span>
          )}
        </span>
      </Fragment>
    ));

  return (
    <>
      <span className="sr-only">{muted ? `${text} ${muted}` : text}</span>
      <span aria-hidden="true">
        {render(text)}
        {muted && (
          <>
            {muted.startsWith(",") ? "" : " "}
            {render(muted, "muted", 1)}
          </>
        )}
      </span>
    </>
  );
}
