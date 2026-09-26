export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      // plain browser <script> files, not ES modules
      sourceType: "script",
    },
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ForInStatement",
          message:
            "for...in loops over keys (as strings). Use for...of for values, or Object.entries() for objects.",
        },
      ],
    },
  },
];
