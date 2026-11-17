/**
 * Test-only module resolver.
 *
 * The application is bundled by Next.js, which resolves extensionless imports
 * and the `@/` alias. Node's native test runner does neither, so the tests load
 * this hook to resolve those specifiers against the real source files. Nothing
 * in the application is changed by this file.
 */
import { registerHooks } from "node:module";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));

function isFile(candidate) {
  try {
    return existsSync(candidate) && statSync(candidate).isFile();
  } catch {
    return false;
  }
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    let candidate = null;

    if (specifier.startsWith("@/")) {
      candidate = path.join(repoRoot, specifier.slice(2));
    } else if (
      specifier.startsWith(".") &&
      context.parentURL?.startsWith("file:")
    ) {
      try {
        candidate = path.resolve(
          path.dirname(fileURLToPath(context.parentURL)),
          specifier,
        );
      } catch {
        candidate = null;
      }
    }

    if (candidate) {
      for (const suffix of [".ts", ".tsx", "/index.ts", "/index.tsx"]) {
        if (isFile(candidate + suffix)) {
          return {
            url: pathToFileURL(candidate + suffix).href,
            shortCircuit: true,
          };
        }
      }
    }

    return nextResolve(specifier, context);
  },
});
