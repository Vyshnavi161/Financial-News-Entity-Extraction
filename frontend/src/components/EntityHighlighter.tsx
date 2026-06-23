import React from "react";

interface Token {
  text: string;
  label: string;
  confidence: number;
}

interface EntityHighlighterProps {
  tokens: Token[];
}

export const EntityHighlighter: React.FC<EntityHighlighterProps> = ({ tokens }) => {
  if (!tokens || tokens.length === 0) {
    return <span className="text-slate-400">No entities analyzed yet.</span>;
  }

  // Define styling maps
  const tagStyles: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    ORG: {
      bg: "bg-blue-500/10 hover:bg-blue-500/25",
      border: "border-blue-500/30",
      text: "text-blue-400",
      badge: "bg-blue-500 text-white"
    },
    TICKER: {
      bg: "bg-red-500/10 hover:bg-red-500/25",
      border: "border-red-500/30",
      text: "text-red-400",
      badge: "bg-red-500 text-white"
    },
    MONEY: {
      bg: "bg-emerald-500/10 hover:bg-emerald-500/25",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      badge: "bg-emerald-500 text-white"
    },
    EVENT: {
      bg: "bg-orange-500/10 hover:bg-orange-500/25",
      border: "border-orange-500/30",
      text: "text-orange-400",
      badge: "bg-orange-500 text-white"
    },
    DATE: {
      bg: "bg-purple-500/10 hover:bg-purple-500/25",
      border: "border-purple-500/30",
      text: "text-purple-400",
      badge: "bg-purple-500 text-white"
    }
  };

  // Group consecutive tokens belonging to the same entity
  type EntityGroup = {
  tokens: string[];
  type: string;
  confs: number[];
};

const groups: { text: string; type: string | null; confidence: number }[] = [];
let currentGroup: EntityGroup | null = null;

  tokens.forEach((t) => {
    if (t.label === "O") {
      if (currentGroup) {
        groups.push({
          text: currentGroup.tokens.join(" "),
          type: currentGroup.type,
          confidence:
  currentGroup.confs.reduce(
    (a: number, b: number) => a + b,
    0
  ) / currentGroup.confs.length
        });
        currentGroup = null;
      }
      groups.push({ text: t.text, type: null, confidence: t.confidence });
    } else {
      const parts = t.label.split("-");
      const isBegin = parts[0] === "B";
      const entType: string = parts[1] || "";

      if (isBegin) {
        if (currentGroup) {
          groups.push({
            text: currentGroup.tokens.join(" "),
            type: currentGroup.type,
            confidence: currentGroup.confs.reduce((a, b) => a + b, 0) / currentGroup.confs.length
          });
        }
        currentGroup = { tokens: [t.text], type: entType, confs: [t.confidence] };
      } else {
        // I- tag
        if (currentGroup && currentGroup.type === entType) {
          currentGroup.tokens.push(t.text);
          currentGroup.confs.push(t.confidence);
        } else {
          // If out of place, treat as Begin
          if (currentGroup) {
            groups.push({
              text: currentGroup.tokens.join(" "),
              type: currentGroup.type,
              confidence: currentGroup.confs.reduce((a, b) => a + b, 0) / currentGroup.confs.length
            });
          }
          currentGroup = { tokens: [t.text], type: entType, confs: [t.confidence] };
        }
      }
    }
  });

  const finalGroup = currentGroup as EntityGroup | null;

if (finalGroup) {
  groups.push({
    text: finalGroup.tokens.join(" "),
    type: finalGroup.type,
    confidence:
      finalGroup.confs.reduce(
        (a: number, b: number) => a + b,
        0
      ) / finalGroup.confs.length,
  });
}

  // Render reconstruction
  return (
    <p className="leading-relaxed text-slate-300 font-sans text-base md:text-lg select-text">
      {groups.map((g, i) => {
        const needsSpaceBefore = i > 0 && !/^[\.,:;!\?'"\)\-\%]/.test(g.text) && g.text !== "(";
        const space = needsSpaceBefore ? " " : "";

        if (!g.type) {
          return (
            <React.Fragment key={i}>
              {space}
              <span>{g.text}</span>
            </React.Fragment>
          );
        }

        const styles = tagStyles[g.type.toUpperCase()] || {
          bg: "bg-slate-500/10",
          border: "border-slate-500/30",
          text: "text-slate-300",
          badge: "bg-slate-500"
        };

        return (
          <React.Fragment key={i}>
            {space}
            <span
              className={`inline-flex items-center px-2 py-0.5 mx-0.5 rounded-lg border ${styles.bg} ${styles.border} ${styles.text} transition-all duration-200 cursor-pointer font-medium group relative`}
              title={`Confidence: ${(g.confidence * 100).toFixed(1)}%`}
            >
              {g.text}
              <span className={`ml-1.5 text-[10px] px-1 py-px rounded font-semibold uppercase tracking-wider ${styles.badge}`}>
                {g.type}
              </span>
              
              {/* Tooltip for confidence */}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-slate-950 text-slate-100 text-[10px] rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-slate-800">
                Confidence: {(g.confidence * 100).toFixed(1)}%
              </span>
            </span>
          </React.Fragment>
        );
      })}
    </p>
  );
};
