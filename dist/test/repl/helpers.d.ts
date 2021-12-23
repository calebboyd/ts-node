/// <reference types="node" />
import { PassThrough } from 'stream';
import { tsNodeTypes } from '../helpers';
import type { ExecutionContext } from 'ava';
export interface ContextWithTsNodeUnderTest {
    tsNodeUnderTest: Pick<typeof tsNodeTypes, 'create' | 'register' | 'createRepl'>;
}
export interface CreateReplViaApiOptions {
    registerHooks: true;
    createReplOpts?: Partial<tsNodeTypes.CreateReplOptions>;
    createServiceOpts?: Partial<tsNodeTypes.CreateOptions>;
}
/**
 * pass to test.context() to get REPL testing helper functions
 */
export declare function contextReplHelpers(t: ExecutionContext<ContextWithTsNodeUnderTest>): Promise<{
    createReplViaApi: ({ registerHooks, createReplOpts, createServiceOpts, }: CreateReplViaApiOptions) => {
        stdin: PassThrough;
        stdout: PassThrough;
        stderr: PassThrough;
        replService: tsNodeTypes.ReplService;
        service: tsNodeTypes.Service;
    };
    executeInRepl: (input: string, options: CreateReplViaApiOptions & {
        waitMs?: number;
        waitPattern?: string | RegExp;
        /** When specified, calls `startInternal` instead of `start` and passes options */
        startInternalOptions?: Parameters<tsNodeTypes.ReplService['startInternal']>[0];
    }) => Promise<{
        stdin: PassThrough;
        stdout: string;
        stderr: string;
    }>;
}>;
