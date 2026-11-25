/* Number pad and PIN dots for code screens (SIM PIN, screen lock, …).
   Prototype: pad() and dots(). Keys only DRAW: each has data-act="pad" and
   data-d="0"–"9" | "del" | "ok"; the house updates the code with pinPress().
   Styles use the extra class .pinpad so other number pads (e.g. Smart-KOOD in
   the browser) are not affected. The lessons target `.numpad` and `.pinbox`. */

const DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** One key press on a PIN: digit adds (up to max), "del" removes the last one. */
export function pinPress(value: string, key: string, max = 4): string {
  if (key === "del") return value.slice(0, -1);
  if (/^\d$/.test(key) && value.length < max) return value + key;
  return value;
}

/** The number pad. `withOk` = show an OK key (Android); iPhone checks the code by itself. */
export function PinPad({ withOk }: { withOk: boolean }) {
  return (
    <div className="numpad pinpad">
      {DIGITS.map((d) => (
        <button type="button" key={d} data-act="pad" data-d={d}>
          {d}
        </button>
      ))}
      <button type="button" className="k-txt" data-act="pad" data-d="del" aria-label="Kustuta">
        ⌫
      </button>
      <button type="button" data-act="pad" data-d="0">
        0
      </button>
      {withOk ? (
        <button type="button" className="k-ok" data-act="pad" data-d="ok">
          OK
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
    </div>
  );
}

/** Filled / empty circles showing how many digits are entered. */
export function PinDots({ value, length = 4 }: { value: string; length?: number }) {
  return (
    <div className="dots" aria-label={`${value.length}/${length}`}>
      {Array.from({ length }, (_, i) => (
        <i key={i} className={i < value.length ? "f" : ""} />
      ))}
    </div>
  );
}
