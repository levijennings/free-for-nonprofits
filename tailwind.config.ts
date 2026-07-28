import type { Config } from "tailwindcss";

/**
 * Semantic tokens are defined in src/app/globals.css and mapped here.
 * New work should use the semantic names (surface, fg, accent, status-*),
 * not the raw `brand-*` scale.
 *
 * The `brand-*` ramp is retained because 360 utilities across the existing
 * pages still reference it. It is a migration shim, not a token layer —
 * remove it once those call sites are ported.
 */
const token = (name: string) => `hsl(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ---- semantic (use these) ---- */
        surface: {
          DEFAULT: token("surface"),
          subtle: token("surface-subtle"),
          raised: token("surface-raised"),
          inset: token("surface-inset"),
        },
        line: {
          DEFAULT: token("border"),
          strong: token("border-strong"),
        },
        fg: {
          DEFAULT: token("fg"),
          muted: token("fg-muted"),
          subtle: token("fg-subtle"),
        },
        accent: {
          DEFAULT: token("accent"),
          hover: token("accent-hover"),
          fg: token("accent-fg"),
          subtle: token("accent-subtle"),
          line: token("accent-line"),
        },
        status: {
          none: token("status-none"),
          progress: token("status-progress"),
          done: token("status-done"),
          warn: token("status-warn"),
          "progress-bg": token("status-progress-bg"),
          "done-bg": token("status-done-bg"),
          "warn-bg": token("status-warn-bg"),
        },
        focus: token("focus"),

        /* ---- migration shim: existing pages only ---- */
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
        },
      },

      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      /* Seven steps. Previously 18 sizes were in use, six of them arbitrary
         pixel values, with ~79% of all text at sm or xs. */
      fontSize: {
        micro: ["0.72rem", { lineHeight: "1.4", letterSpacing: "0.055em", fontWeight: "650" }],
        xs: ["0.8125rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.55" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.55" }],
        h3: ["1.0625rem", { lineHeight: "1.35", letterSpacing: "-0.015em" }],
        h2: ["1.4375rem", { lineHeight: "1.25", letterSpacing: "-0.022em" }],
        h1: ["2.125rem", { lineHeight: "1.15", letterSpacing: "-0.028em" }],
        display: ["3.25rem", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
      },

      /* Three, not six. */
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },

      /* Three, not nine. */
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
      },

      /* Two durations, two easings. Previously one explicit duration existed
         in the whole codebase, and it was in dead code. */
      transitionDuration: {
        fast: "120ms",
        DEFAULT: "200ms",
        slow: "420ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(.2,.8,.2,1)",
        "in-out": "cubic-bezier(.4,0,.2,1)",
      },

      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(7px)" },
          to: { opacity: "1", transform: "none" },
        },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
      },
      animation: {
        rise: "rise 420ms cubic-bezier(.2,.8,.2,1) both",
        fade: "fade 200ms cubic-bezier(.2,.8,.2,1) both",
      },
    },
  },
  plugins: [],
};
export default config;
