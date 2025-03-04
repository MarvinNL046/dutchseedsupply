/** @type {import('tailwindcss').Config} */
module.exports = {
  "darkMode": [
    "class"
  ],
  "content": [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  "theme": {
    "extend": {
      "colors": {
        "primary": {
          "DEFAULT": "#4D7C0F",
          "light": "#84CC16",
          "dark": "#3F6212",
          "foreground": "#FFFFFF"
        },
        "secondary": {
          "DEFAULT": "#F59E0B",
          "light": "#FBBF24",
          "dark": "#D97706",
          "foreground": "#FFFFFF"
        },
        "accent": {
          "DEFAULT": "#ECFCCB",
          "dark": "#ECFCCB",
          "foreground": "#3F6212"
        },
        "neutral": {
          "DEFAULT": "#E9ECEF",
          "dark": "#CED4DA"
        },
        "warning": "#FFD166",
        "error": "#EF476F",
        "destructive": {
          "DEFAULT": "#EF476F",
          "foreground": "#FFFFFF"
        },
        "muted": {
          "DEFAULT": "#F8F9FA",
          "foreground": "#6C757D"
        },
        "card": {
          "DEFAULT": "#FFFFFF",
          "foreground": "#212529"
        },
        "background": "#FFFFFF",
        "foreground": "#212529",
        "border": "#E9ECEF",
        "input": "#CED4DA",
        "ring": "#4D7C0F",
        "dark-primary": {
          "DEFAULT": "#84CC16",
          "light": "#F59E0B",
          "dark": "#4D7C0F",
          "foreground": "#FFFFFF"
        },
        "dark-background": "#1A1A1A",
        "dark-foreground": "#E9ECEF",
        "dark-card": {
          "DEFAULT": "#2A2A2A",
          "foreground": "#E9ECEF"
        },
        "dark-muted": {
          "DEFAULT": "#3A3A3A",
          "foreground": "#ADB5BD"
        },
        "dark-border": "#3A3A3A",
        "dark-input": "#3A3A3A"
      },
      "fontFamily": {
        "sans": [
          "Open Sans",
          "sans-serif"
        ],
        "heading": [
          "Poppins",
          "sans-serif"
        ],
        "accent": [
          "Merriweather",
          "serif"
        ]
      },
      "borderRadius": {
        "lg": "0.5rem",
        "md": "0.375rem",
        "sm": "0.25rem"
      }
    }
  },
  "plugins": []
};