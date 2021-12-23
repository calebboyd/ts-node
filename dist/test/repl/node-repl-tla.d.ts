/// <reference types="node" />
import { Stream } from 'stream';
import type { ContextWithTsNodeUnderTest } from './helpers';
interface SharedObjects extends ContextWithTsNodeUnderTest {
    TEST_DIR: string;
}
export declare function upstreamTopLevelAwaitTests({ TEST_DIR, tsNodeUnderTest, }: SharedObjects): Promise<void>;
declare class ArrayStream extends Stream {
    readable: boolean;
    writable: boolean;
    run(data: string[]): void;
    pause(): void;
    resume(): void;
    write(_chunk: Buffer | string, _encoding: string, _callback: () => {}): void;
}
export declare class REPLStream extends ArrayStream {
    waitingForResponse: boolean;
    lines: string[];
    constructor();
    write(chunk: Buffer | string, encoding: string, callback: () => void): boolean;
    wait(): Promise<string[]>;
}
export {};
