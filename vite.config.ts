import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  base: "/SpotyFusion/",
  plugins: [react(), basicSsl()],
  server: {
    port: 3000,
  },
});
