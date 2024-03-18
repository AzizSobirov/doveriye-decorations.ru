import { createUnimport as _createUnimport } from "unimport";
import { writeFile } from "fs/promises";
import { slash } from "@antfu/utils";
import * as path from "path";
import fg from "fast-glob";
import type { BuiltinPresetName, Preset } from "unimport";
import type { AstroConfig, AstroIntegration } from "astro";
import type { Plugin } from "vite";

type Options = {
  dts?: boolean | string;
  presets?: (Preset | BuiltinPresetName)[];
};

const components = fg.sync("components/**/*.astro");
const layouts = fg.sync("layouts/**/*.astro");
const customs = fg.sync("imports/**/*");

let unimport: ReturnType<typeof createUnimport>;
const getName = (p: string) => path.parse(p).name;

const createUnimport = (presets: (Preset | BuiltinPresetName)[]) =>
  _createUnimport({
    imports: [
      ...components.map((componentFilePath) => ({
        name: "default",
        as: getName(componentFilePath),
        from: componentFilePath,
      })),
      ...layouts.map((layoutFilePath) => ({
        name: "default",
        as: getName(layoutFilePath),
        from: layoutFilePath,
      })),
      ...customs.map((customFilePath) => ({
        name: "default",
        as: getName(customFilePath),
        from: customFilePath,
      })),
    ],
  });

const generateTypeDeclarations = async (file: string) => {
  const dir = path.dirname(file);
  return unimport.generateTypeDeclarations({
    resolvePath: (i) => {
      if (i.from.startsWith(".") || path.isAbsolute(i.from)) {
        const related = slash(
          path.relative(dir, i.from).replace(/\.ts(x)?$/, "")
        );

        return related;
      }

      return i.from;
    },
  });
};

export default (options: Options = {}) => {
  const { dts: _dts = true, presets = [] } = options;
  let dts: string = "";

  if (_dts) {
    if (typeof _dts === "boolean") dts = "auto-imports.d.ts";
    else if (_dts) dts = _dts;
  }

  const pdts = path.posix.resolve(dts);

  unimport = createUnimport(presets);

  return {
    name: "astro-imports",
    hooks: {
      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [
              {
                name: "astro-imports",
                async transform(code, id) {
                  return (await unimport.injectImports(code, id)).code;
                },
                async handleHotUpdate(ctx) {},
                async configureServer(vite) {
                  vite.watcher.on("add", (_path, stats) => {
                    const p = path.resolve(_path);
                    let n = false;

                    if (/components\//i.test(p)) {
                      components.push(p);
                      n = true;
                    } else if (/layouts\//i.test(p)) {
                      layouts.push(p);
                      n = true;
                    } else if (/imports\//i.test(p)) {
                      customs.push(p);
                      n = true;
                    }

                    if (n) unimport = createUnimport(presets);
                  });

                  vite.watcher.on("unlink", (_p) => {
                    const name = getName(_p);
                    components.forEach((v, i) => {
                      if (v === name) components.splice(i, 1);
                    });
                    layouts.forEach((v, i) => {
                      if (v === name) components.splice(i, 1);
                    });
                    customs.forEach((v, i) => {
                      if (v === name) components.splice(i, 1);
                    });
                  });

                  if (dts) {
                    vite.watcher.on("all", async (type, p, stats) => {
                      if (path.posix.resolve(p).includes(pdts)) return;

                      await writeFile(
                        dts,
                        await generateTypeDeclarations(dts),
                        "utf-8"
                      );
                    });
                  }
                },
              },
            ] as Plugin[],
          },
        } as unknown as AstroConfig);
      },
    },
  } as AstroIntegration;
};
