/** @type {import('tailwindcss').Config} */
module.exports={
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
      primary: "var(--color-primary)",  
      secondary: "var(--color-secondary)",
      softBlue: "#E0F2FE",
      softGreen: "#D1FAE5",
      softPurple: "#EDE9FE"
    },
    boxShadow: {
      soft: "0 10px 30px rgba(0,0,0,0.08)"
    },
    borderRadius: {
      xl2: "1.25rem"
    }
    },
  },
  plugins: [],
}