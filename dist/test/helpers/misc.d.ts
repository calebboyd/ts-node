/// <reference types="node" />
/** types from ts-node under test */
import type * as tsNodeTypes from '../../index';
export { tsNodeTypes };
export declare const testsDirRequire: NodeRequire;
export declare const ts: typeof import("typescript");
export declare const delay: typeof setTimeout.__promisify__;
/** Essentially Array:includes, but with tweaked types for checks on enums */
export declare function isOneOf<V>(value: V, arrayOfPossibilities: ReadonlyArray<V>): boolean;
