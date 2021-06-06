import {
  createRequire as nodeCreateRequire,
  createRequireFromPath as nodeCreateRequireFromPath,
} from 'module';
import type _createRequire from 'create-require';
import * as ynModule from 'yn';

/** @internal */
export const createRequire =
  nodeCreateRequire ??
  nodeCreateRequireFromPath ??
  (require('create-require') as typeof _createRequire);

/**
 * Wrapper around yn module that returns `undefined` instead of `null`.
 * This is implemented by yn v4, but we're staying on v3 to avoid v4's node 10 requirement.
 * @internal
 */
export function yn(value: string | undefined) {
  return ynModule(value) ?? undefined;
}

/**
 * Like `Object.assign`, but ignores `undefined` properties.
 *
 * @internal
 */
export function assign<T extends object>(
  initialValue: T,
  ...sources: Array<T>
): T {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      const value = (source as any)[key];
      if (value !== undefined) (initialValue as any)[key] = value;
    }
  }
  return initialValue;
}

/**
 * Split a string array of values.
 * @internal
 */
export function split(value: string | undefined) {
  return typeof value === 'string' ? value.split(/ *, */g) : undefined;
}

/**
 * Parse a string as JSON.
 * @internal
 */
export function parse(value: string | undefined): object | undefined {
  return typeof value === 'string' ? JSON.parse(value) : undefined;
}

/**
 * Replace backslashes with forward slashes.
 * @internal
 */
export function normalizeSlashes(value: string): string {
  return value.replace(/\\/g, '/');
}

/**
 *
 * Determine if a specifier is relative (from node core)
 * @internal
 */
export function isRelativeSpecifier(specifier: string) {
  if (specifier[0] === '.') {
    if (specifier.length === 1 || specifier[1] === '/') return true;
    if (specifier[1] === '.') {
      if (specifier.length === 2 || specifier[2] === '/') return true;
    }
  }
  return false;
}
