import { ExecutionContext, Implementation, OneOrMoreMacros } from 'ava';
export { ExecutionContext };
export declare const test: TestInterface<unknown>;
export { test as _test };
export declare const context: <T extends void | object>(cb: (t: ExecutionContext<unknown>) => Promise<T>) => TestInterface<T>;
export interface TestInterface<Context> {
    /** Declare a concurrent test. */
    (title: string, implementation: Implementation<Context>): void;
    /** Declare a concurrent test that uses one or more macros. Additional arguments are passed to the macro. */
    <T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;
    /** Declare a concurrent test that uses one or more macros. The macro is responsible for generating a unique test title. */
    <T extends any[]>(macros: OneOrMoreMacros<T, Context>, ...rest: T): void;
    serial(title: string, implementation: Implementation<Context>): void;
    /** Declare a concurrent test that uses one or more macros. Additional arguments are passed to the macro. */
    serial<T extends any[]>(title: string, macros: OneOrMoreMacros<T, Context>, ...rest: T): void;
    /** Declare a concurrent test that uses one or more macros. The macro is responsible for generating a unique test title. */
    serial<T extends any[]>(macros: OneOrMoreMacros<T, Context>, ...rest: T): void;
    macro<Args extends any[]>(cb: (...args: Args) => [
        (title: string | undefined) => string | undefined,
        (t: ExecutionContext<Context>) => Promise<void>
    ] | ((t: ExecutionContext<Context>) => Promise<void>)): (test: ExecutionContext<Context>, ...args: Args) => Promise<void> & {
        title(givenTitle: string | undefined, ...args: Args): string;
    };
    beforeAll(cb: (t: ExecutionContext<Context>) => Promise<void>): void;
    beforeEach(cb: (t: ExecutionContext<Context>) => Promise<void>): void;
    context<T extends object | void>(cb: (t: ExecutionContext<Context>) => Promise<T>): TestInterface<Context & T>;
    suite(title: string, cb: (test: TestInterface<Context>) => void): void;
    runSerially(): void;
}
