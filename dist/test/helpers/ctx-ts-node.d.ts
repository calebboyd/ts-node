import type { ExecutionContext } from '../testlib';
import { tsNodeTypes } from './misc';
/** Pass to `test.context()` to get access to the ts-node API under test */
export declare function ctxTsNode(): Promise<{
    tsNodeUnderTest: typeof tsNodeTypes;
}>;
export declare namespace ctxTsNode {
    type Ctx = Awaited<ReturnType<typeof ctxTsNode>>;
    type T = ExecutionContext<Ctx>;
}
/**
 * Pack and install ts-node locally, necessary to test package "exports"
 * FS locking b/c tests run in separate processes
 */
export declare function installTsNode(): Promise<void>;
