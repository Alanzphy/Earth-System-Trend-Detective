import { useId, useState, type ReactNode } from "react";
import { GLOSSARY, type GlossaryKey } from "../lib/glossary";

type Props = {
  term: GlossaryKey;
  children?: ReactNode;
};

/**
 * Toggletip: the term is a button that shows its definition on click or Enter.
 * The definition is also linked with aria-describedby so screen readers announce it on focus.
 */
export function GlossaryTerm({ term, children }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const entry = GLOSSARY[term];

  return (
    <span className="glossary-term">
      <button
        type="button"
        className="glossary-term__button"
        aria-expanded={open}
        aria-describedby={id}
        onClick={() => setOpen((current) => !current)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        {children ?? entry.term}
        <span className="glossary-term__icon" aria-hidden="true">
          ?
        </span>
      </button>
      <span id={id} role="note" className="glossary-term__popover" hidden={!open}>
        <strong>{entry.term}:</strong> {entry.definition}
      </span>
    </span>
  );
}
