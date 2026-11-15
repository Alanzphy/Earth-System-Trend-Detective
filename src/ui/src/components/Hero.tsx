import { FindingCard } from "./FindingCard";
import { TrendMap } from "./TrendMap";

type Props = {
  onOpenCase: () => void;
};

/**
 * First screen: the data artifact (the trend map) fills a dark surface and the
 * finding sits on it, so the product's own output is the argument.
 */
export function Hero({ onOpenCase }: Props) {
  return (
    <section className="hero">
      <div className="hero__map">
        <TrendMap variant="artifact" />
      </div>

      <div className="hero__inner">
        <div className="hero__copy">
          <h1>Watch 45 years of Earth change.</h1>
          <p className="hero__lede">
            Pick a variable, a place and a period. We tell you if it moved, how fast, and whether
            chance can explain it.
          </p>
          <div className="hero__actions">
            <button type="button" className="cta" onClick={onOpenCase}>
              Open the Iberia case
            </button>
            <a className="hero__link" href="#explore">
              or explore your own region
            </a>
          </div>
          <p className="hero__note">
            Descriptive, not a forecast. Every number comes with its method and its p-value.
          </p>
        </div>

        <FindingCard />
      </div>
    </section>
  );
}
