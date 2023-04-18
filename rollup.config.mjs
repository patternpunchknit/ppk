import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
const productionMode = process.env.NODE_ENV === "production";

export default [
  {
    input: "./source/js/index.js",
    treeshake: false,
    output: {
      file: "./htdocs/js/index.js",
      format: "iife",
    },
    plugins: [
      nodeResolve(),
      productionMode &&
      terser({
        compress: {
          module: true,
          toplevel: true,
          passes: 2,
          unsafe_arrows: true,
          drop_console: productionMode,
          drop_debugger: productionMode,
        },
        mangle: { toplevel: true },
        ecma: 2018,
        toplevel: productionMode,
      }),
    ],
  },
];
