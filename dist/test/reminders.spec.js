"use strict";
// Reminders about chores to stay up-to-date with the ecosystem
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const testlib_1 = require("./testlib");
(0, testlib_1.test)('Detect when typescript adds new ModuleKind values; flag as a failure so we can update our code flagged [MUST_UPDATE_FOR_NEW_MODULEKIND]', async () => {
    // We have marked a few places in our code with MUST_UPDATE_FOR_NEW_MODULEKIND to make it easier to update them when TS adds new ModuleKinds
    const foundKeys = [];
    function check(value, name, required) {
        if (required)
            (0, testlib_1.expect)(helpers_1.ts.ModuleKind[name]).toBe(value);
        if (helpers_1.ts.ModuleKind[value] === undefined) {
            (0, testlib_1.expect)(helpers_1.ts.ModuleKind[name]).toBeUndefined();
        }
        else {
            (0, testlib_1.expect)(helpers_1.ts.ModuleKind[value]).toBe(name);
            foundKeys.push(name, `${value}`);
        }
    }
    check(0, 'None', true);
    check(1, 'CommonJS', true);
    check(2, 'AMD', true);
    check(3, 'UMD', true);
    check(4, 'System', true);
    check(5, 'ES2015', true);
    try {
        check(6, 'ES2020', false);
        check(99, 'ESNext', true);
    }
    catch {
        // the value changed: is `99` now, but was `6` in TS 2.7
        check(6, 'ESNext', true);
        (0, testlib_1.expect)(helpers_1.ts.ModuleKind[99]).toBeUndefined();
    }
    check(7, 'ES2022', false);
    if (helpers_1.tsSupportsStableNodeNextNode16) {
        check(100, 'Node16', true);
    }
    else {
        check(100, 'Node12', false);
    }
    check(199, 'NodeNext', false);
    const actualKeys = Object.keys(helpers_1.ts.ModuleKind);
    actualKeys.sort();
    foundKeys.sort();
    (0, testlib_1.expect)(actualKeys).toEqual(foundKeys);
});
//# sourceMappingURL=reminders.spec.js.map