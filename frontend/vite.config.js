// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // ← yeh line zaroori

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ← yeh add karo
  ],
  // esbuild: {
  //   loader: "tsx", // .jsx files ko bhi TS treat kare
  //   include: /src\/.*\.[tj]sx?$/,
  // },
});
