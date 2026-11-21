import {
  ACCENTS,
  EMOJIS,
  LETTER_ROWS,
  SYMBOL_ROWS,
  type KeyboardState,
} from "./keyboardLogic";
import { BackspaceIcon, ShiftIcon, SmileIcon } from "./icons";

/**
 * The replica's on-screen keyboard (prototype keyboard()).
 * It only draws keys: every key has data-act="key" and data-k="<key id>",
 * letters with accents also data-long="keyLong" data-base="<letter>".
 * The lesson engine handles the touches and the screen updates the text
 * with applyKey() / openAccents() from ./keyboardLogic.
 * The lessons rely on these attributes and on the classes .kb and .accpop.
 */
export function Keyboard({ state }: { state: KeyboardState }) {
  const up = (c: string) => (state.shift ? c.toUpperCase() : c);

  const backspace = (
    <button type="button" className="key wide" data-act="key" data-k="bksp" aria-label="Kustuta">
      <BackspaceIcon />
    </button>
  );

  if (state.mode === "emoji") {
    return (
      <div className="kb">
        <div className="emojigrid">
          {EMOJIS.map((e) => (
            <button type="button" key={e} data-act="emojiPick" data-e={e}>
              {e}
            </button>
          ))}
        </div>
        <div className="krow">
          <button type="button" className="key wide" data-act="key" data-k="abc">
            ABC
          </button>
          <button type="button" className="key space" data-act="key" data-k="space">
            space
          </button>
          {backspace}
        </div>
      </div>
    );
  }

  const abc = state.mode === "abc";
  const rows = abc ? LETTER_ROWS : SYMBOL_ROWS;

  /* Accent popup, shown right above the held key. Near the edges of the
     keyboard it is aligned to the key's side so it stays inside the phone. */
  const accentPopup = (base: string, index: number, rowLength: number) => {
    const side = index < 2 ? " at-left" : index > rowLength - 3 ? " at-right" : "";
    return (
      <div className={`accpop${side}`}>
        {ACCENTS[base].map((c) => (
          <button
            type="button"
            key={c}
            className={state.accSel === c ? "sel" : undefined}
            data-act="key"
            data-k={`ch:${up(c)}`}
          >
            {up(c)}
          </button>
        ))}
      </div>
    );
  };

  const charKey = (c: string, index: number, row: string[]) => {
    const shown = up(c);
    const button = (
      <button
        type="button"
        className="key"
        data-act="key"
        data-k={`ch:${shown}`}
        {...(abc && ACCENTS[c] ? { "data-long": "keyLong", "data-base": c } : {})}
      >
        {shown}
      </button>
    );
    if (!(abc && ACCENTS[c])) return <span key={c} className="keyslot">{button}</span>;
    return (
      <span key={c} className="keyslot">
        {state.acc === c && accentPopup(c, index, row.length)}
        {button}
      </span>
    );
  };

  return (
    <div className="kb">
      <div className="krow">{rows[0].map(charKey)}</div>
      <div className="krow">{rows[1].map(charKey)}</div>
      <div className="krow">
        {abc && (
          <button
            type="button"
            className={`key wide${state.shift ? " on" : ""}`}
            data-act="key"
            data-k="shift"
            aria-label="Suurtäht"
            aria-pressed={state.shift}
          >
            <ShiftIcon filled={state.shift} />
          </button>
        )}
        {rows[2].map(charKey)}
        {backspace}
      </div>
      <div className="krow">
        <button type="button" className="key wide" data-act="key" data-k={abc ? "mode123" : "abc"}>
          {abc ? "123" : "ABC"}
        </button>
        {state.emojiKey ? (
          <button type="button" className="key wide" data-act="key" data-k="emoji" aria-label="Emotikonid">
            <SmileIcon />
          </button>
        ) : (
          <button type="button" className="key" data-act="key" data-k="ch:,">
            ,
          </button>
        )}
        <button type="button" className="key space" data-act="key" data-k="space">
          space
        </button>
        <button type="button" className="key" data-act="key" data-k="ch:.">
          .
        </button>
        <button type="button" className="key wide" data-act="key" data-k="enter" aria-label="Reavahetus">
          ↵
        </button>
      </div>
    </div>
  );
}
