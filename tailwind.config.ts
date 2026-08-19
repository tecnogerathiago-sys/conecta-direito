import type { Config } from "tailwindcss";

// ==========================================================
// Design tokens — Conecta Direito
// Fonte única de verdade para cor, tipografia, radius e sombra.
// Não usar valores hex soltos nos componentes: sempre referenciar
// esses tokens (ex: bg-surface, text-foreground-secondary, border-border).
// ==========================================================

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#F7F8FA",
          secondary: "#F1F3F6",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          hover: "#F7F8FA",
        },
        foreground: {
          DEFAULT: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
        border: {
          DEFAULT: "#E5E8EC",
          strong: "#CBD3DD",
        },
        // Azul marinho — marca, ações primárias, navegação
        primary: {
          DEFAULT: "#0F172A",
          hover: "#1E293B",
          foreground: "#FFFFFF",
          subtle: "#F1F5F9",
        },
        // Verde — sucesso, confirmação, CTAs de conclusão
        success: {
          DEFAULT: "#0D9268",
          hover: "#0B7D59",
          foreground: "#FFFFFF",
          subtle: "#ECFDF5",
        },
        // Âmbar — moedas / créditos (identidade própria do produto)
        accent: {
          DEFAULT: "#B45309",
          hover: "#92400E",
          foreground: "#FFFFFF",
          subtle: "#FFFBEB",
        },
        warning: {
          DEFAULT: "#B45309",
          hover: "#92400E",
          foreground: "#FFFFFF",
          subtle: "#FFFBEB",
        },
        destructive: {
          DEFAULT: "#DC2626",
          hover: "#B91C1C",
          foreground: "#FFFFFF",
          subtle: "#FEF2F2",
        },
        info: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          foreground: "#FFFFFF",
          subtle: "#EFF6FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Roboto", "sans-serif"],
      },
      fontSize: {
        display: ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["2rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "700" }],
        h3: ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.6" }],
        small: ["0.8125rem", { lineHeight: "1.5" }],
        caption: ["0.75rem", { lineHeight: "1.4" }],
        label: ["0.8125rem", { lineHeight: "1.4", fontWeight: "500" }],
      },
      spacing: {
        4.5: "1.125rem",
        18: "4.5rem",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(15 23 42 / 0.04)",
        sm: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
        md: "0 4px 12px -2px rgb(15 23 42 / 0.08)",
        popover: "0 8px 24px -4px rgb(15 23 42 / 0.12)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
      maxWidth: {
        shell: "1360px",
      },
    },
  },
  plugins: [],
};

export default config;
