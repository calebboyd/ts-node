import type { ExecutionContext } from '../testlib';
/**
 * This helpers gives you an empty directory in the OS temp directory, *outside*
 * of the git clone.
 *
 * Some tests must run in a directory that is *outside* of the git clone.
 * When TS and ts-node search for a tsconfig, they traverse up the filesystem.
 * If they run inside our git clone, they will find the root tsconfig.json, and
 * we do not always want that.
 */
export declare function ctxTmpDirOutsideCheckout(t: ExecutionContext): Promise<{
    tmpDir: string;
    fixture: {
        cwd: string;
        files: import("@TypeStrong/fs-fixture-builder").File[];
        dir: (dirPath: string, cb?: ((dir: import("@TypeStrong/fs-fixture-builder").DirectoryApi) => void) | undefined) => import("@TypeStrong/fs-fixture-builder").DirectoryApi;
        readFrom: (realFsDirPath: string, targetPath?: string | undefined, ignoredPaths?: string[] | undefined) => void;
        getFile: (path: string) => import("@TypeStrong/fs-fixture-builder").File | undefined;
        getJsonFile: (path: string) => import("@TypeStrong/fs-fixture-builder").JsonFile<any> | undefined;
        add: <T extends import("@TypeStrong/fs-fixture-builder").File>(file: T) => T;
        addFile: (path: string, content?: string | undefined) => import("@TypeStrong/fs-fixture-builder").StringFile;
        addFiles: (files: Record<string, string | object | null | undefined>) => import("@TypeStrong/fs-fixture-builder").File[];
        addJsonFile: (path: string, obj: unknown) => import("@TypeStrong/fs-fixture-builder").JsonFile<any>;
        write: () => void;
        rm: () => void;
        copyFilesFrom: (other: any) => any;
    };
}>;
export declare namespace ctxTmpDirOutsideCheckout {
    type Ctx = Awaited<ReturnType<typeof ctxTmpDirOutsideCheckout>>;
    type T = ExecutionContext<Ctx>;
}
export declare function ctxTmpDir(t: ExecutionContext): Promise<{
    fixture: {
        cwd: string;
        files: import("@TypeStrong/fs-fixture-builder").File[];
        dir: (dirPath: string, cb?: ((dir: import("@TypeStrong/fs-fixture-builder").DirectoryApi) => void) | undefined) => import("@TypeStrong/fs-fixture-builder").DirectoryApi;
        readFrom: (realFsDirPath: string, targetPath?: string | undefined, ignoredPaths?: string[] | undefined) => void;
        getFile: (path: string) => import("@TypeStrong/fs-fixture-builder").File | undefined;
        getJsonFile: (path: string) => import("@TypeStrong/fs-fixture-builder").JsonFile<any> | undefined;
        add: <T extends import("@TypeStrong/fs-fixture-builder").File>(file: T) => T;
        addFile: (path: string, content?: string | undefined) => import("@TypeStrong/fs-fixture-builder").StringFile;
        addFiles: (files: Record<string, string | object | null | undefined>) => import("@TypeStrong/fs-fixture-builder").File[];
        addJsonFile: (path: string, obj: unknown) => import("@TypeStrong/fs-fixture-builder").JsonFile<any>;
        write: () => void;
        rm: () => void;
        copyFilesFrom: (other: any) => any;
    };
    tmpDir: string;
}>;
export declare namespace ctxTmpDir {
    type Ctx = Awaited<ReturnType<typeof ctxTmpDirOutsideCheckout>>;
    type T = ExecutionContext<Ctx>;
}
