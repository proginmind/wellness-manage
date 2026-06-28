import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

export default [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // _prefixed vars are intentionally unused (destructuring discard)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Valid pattern: initializing state from browser API / resetting on condition inside effect
      "react-hooks/set-state-in-effect": "off",
    },
  },
];
