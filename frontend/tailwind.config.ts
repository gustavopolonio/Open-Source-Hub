import type { Config } from "tailwindcss";
import lineClamp from "@tailwindcss/line-clamp";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,html}", // adjust to your project structure
  ],
  theme: {
    extend: {},
  },
  plugins: [lineClamp],
};
export default config;
