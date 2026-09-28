import React, { useState } from "react";
import { ComicPanel, ComicStyleOption } from "../types/comic";
import { PANEL_THEME_IMAGES } from "../data/defaultComic";

interface PanelArtworkProps {
  panel: ComicPanel;
  className?: string;
}

const STYLE_FILTER_MAP: Record<ComicStyleOption, string> = {
  "Comic Book": "contrast-110 saturate-110",
  Manga: "grayscale contrast-125 brightness-105",
  Anime: "saturate-135 contrast-105 brightness-105",
  Cartoon: "saturate-150 contrast-115",
  Watercolor: "saturate-90 contrast-95 brightness-105 sepia-[0.12]",
  Cyberpunk: "contrast-125 saturate-125 hue-rotate-[-12deg]",
};

export const PanelArtwork: React.FC<PanelArtworkProps> = ({
  panel,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  const resolvedSrc =
    panel.imageUrl || PANEL_THEME_IMAGES[panel.visualTheme] || PANEL_THEME_IMAGES.lab_entry;

  const filterClass =
    STYLE_FILTER_MAP[panel.artStyle] || STYLE_FILTER_MAP["Comic Book"];

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-slate-900 select-none ${className}`}
    >
      {!imgError ? (
        <img
          src={resolvedSrc}
          alt={`Panel ${panel.panelNumber}: ${panel.sceneDescription}`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${filterClass}`}
        />
      ) : (
        /* Resilient illustrated SVG comic fallback (Zero-Broken-Image Policy) */
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-6 text-center">
          <svg
            viewBox="0 0 120 90"
            className="w-28 h-20 mb-3 text-amber-400 stroke-current"
            fill="none"
            strokeWidth="2.5"
          >
            <rect x="8" y="8" width="104" height="74" rx="4" className="stroke-slate-600" />
            <circle cx="42" cy="42" r="14" className="stroke-blue-400" />
            <path d="M22 76 C24 60, 60 60, 62 76" className="stroke-blue-400" />
            <rect x="68" y="26" width="28" height="36" rx="4" className="stroke-amber-400" />
            <line x1="74" y1="38" x2="90" y2="38" className="stroke-amber-400" />
          </svg>
          <p className="text-xs font-medium text-slate-200 max-w-xs line-clamp-2">
            {panel.sceneDescription}
          </p>
        </div>
      )}

      {/* Halftone / Ink texture overlay for Manga or Comic Book authenticity */}
      {panel.artStyle === "Manga" && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15 mix-blend-multiply"
          style={{
            backgroundImage:
              "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "6px 6px",
          }}
        />
      )}

      {/* Subtle vignette for contrast with speech bubbles and captions */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-black/30"
      />
    </div>
  );
};
