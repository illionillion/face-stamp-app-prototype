import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/face-stamp-app-prototype/" : "./",
  plugins: [react()],
});
