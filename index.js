const path = require("path")
const fs = require("fs")
const esm = require('esm')(module);

export default function TaorAppRouter(ctx, options) {
  const sourcePath = ctx.paths.sourcePath;
  const config = options?.config ?? "app.config.ts";
  const root = options?.root ?? "app";
  const page = options?.page ?? "page";

  function getRoutes() {
    const basePath = path.join(sourcePath, root);
    const routes = new Set();

    function readDirRecursiveSync(currentDir) {
      const files = fs.readdirSync(currentDir, { withFileTypes: true });
      let hasPageFile = false;
      for (const file of files) {
        const fullPath = path.join(currentDir, file.name);
        if (file.isDirectory()) {
          readDirRecursiveSync(fullPath);
        } else if (
          file.isFile() &&
          new RegExp(`^${page}\.(tsx|jsx|ts|js)$`).test(file.name)
        ) {
          hasPageFile = true;
        }
      }
      if (hasPageFile) {
        routes.add(
          path
            .join(root, path.relative(basePath, currentDir), page)
            .replace(/\\/g, "/")
        );
      }
    }

    readDirRecursiveSync(basePath);

    return [...routes];
  }

  function createRouter() {
    const configPath = path.join(sourcePath, config);
    const exportValue = esm(configPath);
    const configValue = exportValue.default ?? exportValue;
    const newPages = getRoutes();
    if (JSON.stringify(configValue.pages) !== JSON.stringify(newPages)) {
      configValue.pages = newPages;
      fs.writeFileSync(
        configPath,
        `const config = ${JSON.stringify(configValue, null, 2)}` +
        `\nexport default config\n`
      );
    }
  }

  class TaroAutoRouter {
    apply(compiler) {
      compiler.hooks.watchRun.tap("create router", createRouter);
    }
  }

  createRouter();
  ctx.modifyWebpackChain(({ chain }) => {
    chain.plugin("taro-auto-router").use(TaroAutoRouter);
  });
}
