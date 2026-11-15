import { GUESS_ORDER, PREDICTED, QUESTIONS, type Guess, type Guesses, type PredictionResult } from "../lib/prediction";
import { WAKING_MESSAGE } from "../lib/useWaking";
import { CheckIcon } from "./CheckIcon";

type AskProps = {
  name: string;
  guesses: Guesses;
  ready: boolean;
  waking: boolean;
  onGuess: (guesses: Guesses) => void;
  onReveal: () => void;
  onSkip: () => void;
};

/** Before the data: the student commits to a guess for heat, rain and soil moisture. */
export function PredictFirst({ name, guesses, ready, waking, onGuess, onReveal, onSkip }: AskProps) {
  const answered = PREDICTED.every((id) => guesses[id]);
  return (
    <div className="predict">
      <p className="predict__lead">Before you look: what do you think changed here since 1981?</p>
      {PREDICTED.map((id) => (
        <fieldset key={id} className="predict__question">
          <legend>{QUESTIONS[id].question}</legend>
          <div className="predict__choices">
            {GUESS_ORDER.map((guess) => (
              <label key={guess} className="predict__choice">
                <input
                  type="radio"
                  name={`predict-${id}`}
                  value={guess}
                  checked={guesses[id] === guess}
                  onChange={() => onGuess({ ...guesses, [id]: guess })}
                />
                <span>{QUESTIONS[id].choices[guess]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <button type="button" className="button button--sun" disabled={!answered || !ready} onClick={onReveal}>
        {!answered ? "Answer all three to reveal" : ready ? `Reveal ${name}'s data` : waking ? WAKING_MESSAGE : "Reading 45 years of NASA data…"}
      </button>
      <button type="button" className="predict__skip" onClick={onSkip}>
        Skip and show me the data
      </button>
    </div>
  );
}

function label(id: PredictionResult["id"], guess: Guess): string {
  return QUESTIONS[id].choices[guess];
}

/** After the reveal: how many the student called right, question by question. */
export function PredictionScore({ results, right }: { results: PredictionResult[]; right: number }) {
  return (
    <div className="predict-score" aria-live="polite">
      <p className="predict-score__total">
        You called <b className="num">{right} of {results.length}</b> before looking
      </p>
      <ul>
        {results.map((result) => (
          <li key={result.id} className={result.right ? "is-right" : "is-wrong"}>
            <span className="predict-score__mark" aria-hidden="true">
              {result.right ? <CheckIcon /> : "×"}
            </span>
            <span>
              <b>{QUESTIONS[result.id].question}</b>: you said {label(result.id, result.guess).toLowerCase()}
              {!result.right && <>; the data says {label(result.id, result.actual).toLowerCase()}</>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
