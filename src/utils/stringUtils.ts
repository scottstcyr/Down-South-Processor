/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export function isTrueExactly(value: any): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") return ["true", "True", "TRUE", "1", "YES", "yes", "Y", "y"].includes(value);
    if (Array.isArray(value) && value.length === 1) {
        return isTrueExactly(value[0]);
    }
    return false;
}

export function isFalseExactly(value: any): boolean {
    if (value === undefined || value === null) return false;
    if (typeof value === "boolean") return !value;
    if (typeof value === "number") return value === 0;
    if (typeof value === "string") return ["false", "False", "FALSE", "0", "NO", "no", "N", "n"].includes(value);
    if (Array.isArray(value) && value.length === 1) {
        return isFalseExactly(value[0]);
    }
    return false;
}

export function toBoolean(value: string | number | boolean | null | undefined): boolean {
    return isTrueExactly(value);
}

export function toBooleanOrUndefined(value: string | number | boolean | null | undefined): boolean | undefined {
    return value === null || value === undefined ? undefined : toBoolean(value);
}

export function ToNumberOrUndefined(value: any): number | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === "number") return value;
    if (typeof value === "boolean") return value ? 1 : 0;
    if (value) return Number(value);
    // check if a single value in an array
    if (Array.isArray(value) && value.length === 1) {
        return ToNumberOrUndefined(value[0]);
    }
    return undefined;
}

export function isNumber(value: string): boolean {
    return !isNaN(Number(value));
}

export function AssertHasStringValue(value: string | null | undefined): string {
    if (value === undefined || value === null) {
        throw new Error(`Asserted string must have a value but it is ${value}`);
    }
    return value;
}

export function isStringArray(value: any): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function asStringArray(value: string | string[] | null | undefined): string[] {
    if (value === null || value === undefined) return [];
    return typeof value === "string" ? [value] : value;
}

export function stripLeadingZeroes(value: string): string {
    return value.replace(/^0+/, "");
}
