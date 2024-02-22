"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testlib_1 = require("../testlib");
const helpers_1 = require("../helpers");
const Path = require("path");
const helpers_2 = require("../helpers");
const exec_1 = require("../helpers/exec");
const fs_fixture_builder_1 = require("@TypeStrong/fs-fixture-builder");
const test = (0, testlib_1.context)(helpers_2.ctxTsNode);
test.beforeEach(async () => {
    (0, helpers_1.resetNodeEnvironment)();
});
// Declare one test case for each permutations of project configuration
test.suite('TypeScript module=NodeNext and Node16', (test) => {
    test.if(helpers_1.tsSupportsStableNodeNextNode16 && helpers_1.nodeSupportsImportingTransformedCjsFromEsm);
    for (const allowJs of [true, false]) {
        for (const typecheckMode of ['typecheck', 'transpileOnly', 'swc']) {
            for (const packageJsonType of [undefined, 'commonjs', 'module']) {
                for (const tsModuleMode of ['NodeNext', 'Node16']) {
                    declareTest(test, {
                        allowJs,
                        packageJsonType,
                        typecheckMode,
                        tsModuleMode,
                    });
                }
            }
        }
    }
});
function declareTest(test, testParams) {
    const name = `package-json-type=${testParams.packageJsonType} allowJs=${testParams.allowJs} ${testParams.typecheckMode} tsconfig-module=${testParams.tsModuleMode}`;
    test(name, async (t) => {
        const proj = writeFixturesToFilesystem(name, testParams);
        t.log(`Running this command: ( cd ${proj.cwd} ; ${helpers_1.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} --esm ./index.mjs )`);
        // All assertions happen within the fixture scripts
        // Zero exit code indicates a passing test
        const r = await (0, exec_1.exec)(`${helpers_1.CMD_TS_NODE_WITHOUT_PROJECT_FLAG} --esm ./index.mjs`, {
            cwd: proj.cwd,
        });
        t.log(r.stdout);
        t.log(r.stderr);
        (0, testlib_1.expect)(r.err).toBe(null);
        (0, testlib_1.expect)(r.stdout).toMatch(/done\n$/);
    });
}
const packageJsonTypes = [undefined, 'commonjs', 'module'];
const typecheckModes = ['typecheck', 'transpileOnly', 'swc'];
const importStyles = ['static import', 'require', 'dynamic import', 'import = require'];
const importExtension = ['js', 'ts', 'omitted'];
const extensions = [
    {
        ext: 'cts',
        jsEquivalentExt: 'cjs',
        forcesCjs: true,
    },
    {
        ext: 'cjs',
        forcesCjs: true,
        isJs: true,
    },
    {
        ext: 'mts',
        jsEquivalentExt: 'mjs',
        forcesEsm: true,
    },
    {
        ext: 'mjs',
        forcesEsm: true,
        isJs: true,
    },
    {
        ext: 'ts',
        jsEquivalentExt: 'js',
        cjsAllowsOmittingExt: true,
    },
    {
        ext: 'tsx',
        jsEquivalentExt: 'js',
        supportsJsx: true,
        isJsxExt: true,
        cjsAllowsOmittingExt: true,
    },
    {
        ext: 'jsx',
        jsEquivalentExt: 'js',
        isJs: true,
        supportsJsx: true,
        isJsxExt: true,
        cjsAllowsOmittingExt: true,
    },
    {
        ext: 'js',
        isJs: true,
        cjsAllowsOmittingExt: true,
    },
];
/**
 * Describe how a given project config handles files with this extension.
 * For example, projects with allowJs:false do not like .jsx
 */
function getExtensionTreatment(ext, testParams) {
    // JSX and any TS extensions get compiled.  Everything is compiled in allowJs mode
    const isCompiled = testParams.allowJs || !ext.isJs || ext.isJsxExt;
    const isExecutedAsEsm = ext.forcesEsm || (!ext.forcesCjs && testParams.packageJsonType === 'module');
    const isExecutedAsCjs = !isExecutedAsEsm;
    // if allowJs:false, then .jsx files are not allowed
    const isAllowed = !ext.isJsxExt || !ext.isJs || testParams.allowJs;
    const canHaveJsxSyntax = ext.isJsxExt || (ext.supportsJsx && isCompiled);
    return {
        isCompiled,
        isExecutedAsCjs,
        isExecutedAsEsm,
        isAllowed,
        canHaveJsxSyntax,
    };
}
function writeFixturesToFilesystem(name, testParams) {
    const { packageJsonType, allowJs, typecheckMode, tsModuleMode } = testParams;
    const proj = (0, fs_fixture_builder_1.project)(name.replace(/ /g, '_'));
    proj.addJsonFile('package.json', {
        type: packageJsonType,
    });
    proj.addJsonFile('tsconfig.json', {
        compilerOptions: {
            allowJs,
            target: 'esnext',
            module: tsModuleMode,
            jsx: 'react',
        },
        'ts-node': {
            transpileOnly: typecheckMode === 'transpileOnly' || undefined,
            swc: typecheckMode === 'swc',
            experimentalResolver: true,
        },
    });
    const indexFile = (0, fs_fixture_builder_1.file)('index.mjs', ``);
    proj.add(indexFile);
    for (const importStyle of importStyles) {
        for (const importerExtension of extensions) {
            const importer = createImporter(proj, testParams, {
                importStyle,
                importerExtension,
            });
            if (!importer)
                continue;
            let importSpecifier = `./${Path.relative(proj.cwd, importer.path)}`;
            importSpecifier = replaceExtension(importSpecifier, importerExtension.jsEquivalentExt ?? importerExtension.ext);
            indexFile.content += `await import('${importSpecifier}');\n`;
        }
    }
    indexFile.content += `console.log('done');\n`;
    proj.rm();
    proj.write();
    return proj;
}
function createImporter(proj, testParams, importerParams) {
    const { importStyle, importerExtension } = importerParams;
    const name = `${importStyle} from ${importerExtension.ext}`;
    const importerTreatment = getExtensionTreatment(importerExtension, testParams);
    if (!importerTreatment.isAllowed)
        return;
    // import = require only allowed in non-js files
    if (importStyle === 'import = require' && importerExtension.isJs)
        return;
    // const = require not allowed in ESM
    if (importStyle === 'require' && importerTreatment.isExecutedAsEsm)
        return;
    // swc bug: import = require will not work in ESM, because swc does not emit necessary `__require = createRequire()`
    if (testParams.typecheckMode === 'swc' && importStyle === 'import = require' && importerTreatment.isExecutedAsEsm)
        return;
    const importer = {
        type: 'string',
        path: `${name.replace(/ /g, '_')}.${importerExtension.ext}`,
        imports: '',
        assertions: '',
        get content() {
            return `
          ${this.imports}
          async function main() {
            ${this.assertions}
          }
          main();
        `;
        },
    };
    proj.add(importer);
    if (!importerExtension.isJs)
        importer.imports += `export {};\n`;
    for (const importeeExtension of extensions) {
        const ci = createImportee(testParams, { importeeExtension });
        if (!ci)
            continue;
        const { importee, treatment: importeeTreatment } = ci;
        proj.add(importee);
        // dynamic import is the only way to import ESM from CJS
        if (importeeTreatment.isExecutedAsEsm && importerTreatment.isExecutedAsCjs && importStyle !== 'dynamic import')
            continue;
        // Cannot import = require an ESM file
        if (importeeTreatment.isExecutedAsEsm && importStyle === 'import = require')
            continue;
        // Cannot use static imports in non-compiled non-ESM
        if (importStyle === 'static import' && !importerTreatment.isCompiled && importerTreatment.isExecutedAsCjs)
            continue;
        let importSpecifier = `./${importeeExtension.ext}`;
        if (!importeeExtension.cjsAllowsOmittingExt || (0, helpers_1.isOneOf)(importStyle, ['dynamic import', 'static import']))
            importSpecifier += '.' + (importeeExtension.jsEquivalentExt ?? importeeExtension.ext);
        switch (importStyle) {
            case 'dynamic import':
                importer.assertions += `const ${importeeExtension.ext} = await import('${importSpecifier}');\n`;
                break;
            case 'import = require':
                importer.imports += `import ${importeeExtension.ext} = require('${importSpecifier}');\n`;
                break;
            case 'require':
                importer.imports += `const ${importeeExtension.ext} = require('${importSpecifier}');\n`;
                break;
            case 'static import':
                importer.imports += `import * as ${importeeExtension.ext} from '${importSpecifier}';\n`;
                break;
        }
        // Check both namespace.ext and namespace.default.ext, because node can't detect named exports from files we transform
        const namespaceAsAny = importerExtension.isJs ? importeeExtension.ext : `(${importeeExtension.ext} as any)`;
        importer.assertions += `if((${importeeExtension.ext}.ext ?? ${namespaceAsAny}.default.ext) !== '${importeeExtension.ext}')\n`;
        importer.assertions += `  throw new Error('Wrong export from importee: expected ${importeeExtension.ext} but got ' + ${importeeExtension.ext}.ext + '(importee has these keys: ' + Object.keys(${importeeExtension.ext}) + ')');\n`;
    }
    return importer;
}
function createImportee(testParams, importeeParams) {
    const { importeeExtension } = importeeParams;
    const importee = (0, fs_fixture_builder_1.file)(`${importeeExtension.ext}.${importeeExtension.ext}`);
    const treatment = getExtensionTreatment(importeeExtension, testParams);
    if (!treatment.isAllowed)
        return;
    if (treatment.isCompiled || treatment.isExecutedAsEsm) {
        importee.content += `export const ext = '${importeeExtension.ext}';\n`;
    }
    else {
        importee.content += `exports.ext = '${importeeExtension.ext}';\n`;
    }
    if (!importeeExtension.isJs) {
        importee.content += `const testTsTypeSyntax: string = 'a string';\n`;
    }
    if (treatment.isExecutedAsCjs) {
        importee.content += `if(typeof __filename !== 'string') throw new Error('expected file to be CJS but __filename is not declared');\n`;
    }
    else {
        importee.content += `if(typeof __filename !== 'undefined') throw new Error('expected file to be ESM but __filename is declared');\n`;
        importee.content += `if(typeof import.meta.url !== 'string') throw new Error('expected file to be ESM but import.meta.url is not declared');\n`;
    }
    if (treatment.canHaveJsxSyntax) {
        importee.content += `
          const React = {
            createElement(tag, dunno, content) {
              return {props: {children: [content]}};
            }
          };
          const jsxTest = <a>Hello World</a>;
          if(jsxTest?.props?.children[0] !== 'Hello World') throw new Error('Expected ${importeeExtension.ext} to support JSX but it did not.');
        `;
    }
    return { importee, treatment };
}
function replaceExtension(path, ext) {
    return Path.posix.format({
        ...Path.parse(path),
        ext: '.' + ext,
        base: undefined,
    });
}
//# sourceMappingURL=module-node.spec.js.map