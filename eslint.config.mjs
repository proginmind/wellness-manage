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
      // Not using the React Compiler; react-hook-form's form.watch() triggers false positives
      "react-compiler/react-compiler": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
];
