import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class HelperService {

    constructor() { }

    public getUpdatedFields<T>(original: T, changes: Partial<T>): Partial<T> {
        const updatedFields: Partial<T> = {};

        // Iterate over the keys in the changes object
        Object.keys(changes).forEach(key => {
            const typedKey = key as keyof T;  // Ensure the key is typed correctly for the generic type T
            const changeValue = changes[typedKey];

            // We check if the value is defined and if it's different from the original
            if (changeValue !== undefined && changeValue !== original[typedKey]) {
                updatedFields[typedKey] = changeValue;
            }
        });

        return updatedFields;
    }
}