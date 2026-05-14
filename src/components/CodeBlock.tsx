"use client";

import { Highlight, themes } from "prism-react-renderer";

type CodeBlockProps = {
  code: string;
  /** Prism grammar key; `openqasm` is highlighted as `c` (bundled C-like tokens). */
  language: "python" | "openqasm";
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const prismLanguage = language === "openqasm" ? "c" : language;
  const label = language === "openqasm" ? "OpenQASM 3" : "Python";

  return (
    <figure className="overflow-hidden rounded-lg border border-zinc-700/80 bg-zinc-950/80">
      <figcaption className="border-b border-zinc-800 px-3 py-1.5 font-mono text-xs font-medium tracking-wide text-zinc-400">
        {label}
      </figcaption>
      <Highlight
        theme={themes.oneDark}
        code={code.trimEnd()}
        language={prismLanguage}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} m-0 overflow-x-auto p-4 text-sm leading-relaxed`}
            style={{ ...style, background: "transparent" }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </figure>
  );
}
