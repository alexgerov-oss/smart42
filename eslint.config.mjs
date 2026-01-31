import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"

export default defineConfig([
  ...nextVitals,

  // override default ignores of eslint-config-next (по Next docs)
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
])
