export function isNil<T>(value: T | undefined | null): value is undefined | null {
    return value === undefined || value === null;
}

export function isNotNil<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

export function isBlankOrNil<T>(value: T | string | undefined | null): value is undefined | null | "" {
    return value === undefined || value === null || (typeof value === "string" && (value.trim().length === 0 || value === "null" || value === "undefined" || value === "NaN"));
}

export function isAncestorClassOf<BaseType extends new (...args: any) => any>(base: BaseType) {
    return <DerivedType extends new (...args: any) => any>(derived: DerivedType): boolean => {
        return derived.prototype instanceof base;
    };
}

export function isNotBlankOrNil<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null && (typeof value !== "string" || (value.trim().length > 0 && value !== "null" && value !== "undefined" && value !== "NaN"));
}

export function assertIsClass<T>(classConstructor: new (...args: any[]) => T, obj: any): T {
    if (!(obj instanceof classConstructor)) {
        console.log(`Object ${JSON.stringify(obj)} is not an instance of ${classConstructor.name}`);
        throw new Error("Object doesn't match the expected type");
    }
    return obj;
}

export function hasId(entity: object): entity is { id: any } {
    return "id" in entity;
}

// this is not working for types
// see https://chat.openai.com/share/cbbcb288-8d62-4788-a9e2-a9821e8919f7 for discussion and possible remedy
//
export function deepClone<T>(source: T, target?: T): T {
    if (source === null) return source; // Handle null
    if (typeof source !== "object") return source; // Handle non-objects (primitive types)

    if (Array.isArray(source)) {
        if (target === undefined) target = [] as T; // Assign target if undefined
        if (!Array.isArray(target)) {
            target = [] as T;
            // throw new Error('Target is not an array while source is.');
        }
        if (Array.isArray(target)) {
            // reasset it is an array to clean up TS messages
            for (let i = 0; i < source.length; i++) {
                if (typeof source[i] === "object") {
                    target[i] = Array.isArray(source[i]) ? [] : {};
                    deepClone(source[i], target[i]);
                } else {
                    target[i] = source[i];
                }
            }
        }
        return target as T;
    } else {
        if (target === undefined) target = {} as T; // Assign target if undefined
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                const val = source[key];
                if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
                    target[key] = val;
                } else if (typeof val === "object") {
                    target[key] = typeof val === "object" && val !== null ? ({} as T[Extract<keyof T, string>]) : (null as T[Extract<keyof T, string>]);
                    deepClone(val, target[key]);
                }
            }
        }
        return target;
    }
}

export function getEnumNameByValue(e: any, value: number): string | undefined {
    return e[value];
}

// This is NOT working.  Can't figure out why.  Both ChatGPT and Claude say it should
export function removeNullProperties(input: any): any {
    if (input === null || input === undefined) {
        return undefined;
    }

    if (Array.isArray(input)) {
        return input.map((item) => removeNullProperties(item));
    }

    if (typeof input === "object") {
        const result: { [key: string]: any } = {};
        for (const key in input) {
            const prop = input[key];
            if (prop !== null && prop !== undefined) {
                result[key] = removeNullProperties(prop) ?? undefined;
            }
        }
        return result;
    }

    return input;
}

// this function can be used to remove sensitive properties from the object during JSON serialization
// sample: const jsonString = JSON.stringify(obj, replacer);
//
export function sanitizeReplace(key: string, value: any): any {
    const blacklist: string[] = ["password", "_environment", "environment", "databaseurl", "databasename", "credentials"];
    const remove: boolean = blacklist.includes(key?.toLowerCase());

    if (remove) {
        // console.log(`Removed key ${key} from JSON serialization`);
        return "***";
    }
    if (value === null) {
        // console.log(`Null removed from key ${key} in JSON serialization`);
        return undefined;
    }
    return value;
}

// export function findFromEnd<T>(array: T[], predicate: (value: T) => boolean): T | undefined {
//     for (let i = array.length - 1; i >= 0; i--) {
//         if (predicate(array[i])) {
//             return array[i];
//         }
//     }
//     return undefined;
// }

export function hasFunction(obj: any, functionName: string): boolean {
    return obj !== undefined && obj !== null && typeof obj === "object" && functionName in obj && typeof obj[functionName] === "function";
}

export function hasProperty(obj: any, propertyName: string): boolean {
    return obj !== undefined && obj !== null && typeof obj === "object" && propertyName in obj;
}

export function sanitizeFileName(filename: string): string {
    // eslint-disable-next-line no-control-regex
    return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

// Function to parse named parameters from command line arguments
export function parseNamedParameters(toLowerName: boolean = false, toLowerValue: boolean = false): Record<string, string> {
    const args = process.argv.slice(2);
    const params: Record<string, string> = {};

    // Parse parameters in format --name=value or --name value
    args.forEach((arg, index) => {
        if (arg.startsWith("--")) {
            // Remove leading '--'
            const rawParam = arg.slice(2);

            if (rawParam.includes("=")) {
                // Format: --name=value
                const equalsIndex = rawParam.indexOf("=");
                let name = rawParam.substring(0, equalsIndex);
                let value = rawParam.substring(equalsIndex + 1);
                
                if (!name) {
                    console.warn(`Warning: Parameter name is empty for argument '${arg}'`);
                    return;
                }
                
                // Ensure name is a string at this point
                const finalName = toLowerName ? name.toLowerCase() : name;
                const finalValue = (toLowerValue && value) ? value.toLowerCase() : value;
                params[finalName] = finalValue;
            } else if (index + 1 < args.length && !args[index + 1]?.startsWith("--")) {
                // Format: --name value
                let name = rawParam;
                let value = args[index + 1] || "";
                if (toLowerName) {
                    name = name.toLowerCase();
                }
                if (toLowerValue && value) {
                    value = value.toLowerCase();
                }
                params[name] = value;
            } else {
                // Flag parameter without value
                let name = rawParam;
                let value = "true";
                if (toLowerName) {
                    name = name.toLowerCase();
                }
                if (toLowerValue) {
                    value = value.toLowerCase();
                }
                params[name] = value;
            }
        }
    });

    return params;
}
