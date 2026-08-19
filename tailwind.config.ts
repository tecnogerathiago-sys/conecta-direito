import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Azul marinho / jurídico — confiança e autoridade
        primary: {
          DEFAULT: "#0F172A",
          light: "#1E293B",
          50: "#F1F5F9",
          100: "#E2E8F0",
          600: "#334155",
          700: "#1E293B",
          900: "#0F172A",
        },
        // Dourado / âmbar — moedas e ações de destaque
        accent: {
          DEFAULT: "#D97706",
          light: "#EAB308",
          50: "#FFFBEB",
          100: "#FEF3C7",
          500: "#EAB308",
          600: "#D97706",
        },
        // Verde esmeralda — CTAs de sucesso (desbloquear, enviar)
        success: {
          DEFAULT: "#10B981",
          50: "#ECFDF5",
          600: "#059669",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Roboto", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
