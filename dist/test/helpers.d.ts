/// <reference types="node" />
import { NodeFS } from '@yarnpkg/fslib';
import type { Readable } from 'stream';
/**
 * types from ts-node under test
 */
import type * as tsNodeTypes from '../index';
export { tsNodeTypes };
export declare const ROOT_DIR: string;
export declare const DIST_DIR: string;
export declare const TEST_DIR: string;
export declare const PROJECT: string;
export declare const BIN_PATH: string;
export declare const BIN_SCRIPT_PATH: string;
export declare const BIN_CWD_PATH: string;
/** Default `ts-node --project` invocation */
export declare const CMD_TS_NODE_WITH_PROJECT_FLAG: string;
/** Default `ts-node` invocation without `--project` */
export declare const CMD_TS_NODE_WITHOUT_PROJECT_FLAG: string;
export declare const EXPERIMENTAL_MODULES_FLAG: string;
export declare const CMD_ESM_LOADER_WITHOUT_PROJECT: string;
export declare const testsDirRequire: NodeRequire;
export declare const ts: any;
export declare const xfs: NodeFS;
/** Pass to `test.context()` to get access to the ts-node API under test */
export declare const contextTsNodeUnderTest: () => Promise<{
    tsNodeUnderTest: typeof tsNodeTypes;
}>;
/**
 * Pack and install ts-node locally, necessary to test package "exports"
 * FS locking b/c tests run in separate processes
 */
export declare function installTsNode(): Promise<void>;
/**
 * Get a stream into a string.
 * Will resolve early if
 */
export declare function getStream(stream: Readable, waitForPattern?: string | RegExp): Promise<string>;
/**
 * Undo all of ts-node & co's installed hooks, resetting the node environment to default
 * so we can run multiple test cases which `.register()` ts-node.
 *
 * Must also play nice with `nyc`'s environmental mutations.
 */
export declare function resetNodeEnvironment(): void;
