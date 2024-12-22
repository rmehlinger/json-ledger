import { cloneDeep } from 'es-toolkit';
import { get, has, set } from 'es-toolkit/compat';

/**
 * Represents a JSON value, which can be a primitive (string, number, boolean, null),
 * or a complex type (JSONObject or JSONArray).
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

/**
 * Represents a JSON object, where keys are strings and values can be of type JSONValue.
 */
export type JSONObject = { [x: string]: JSONValue };

/**
 * Represents a JSON array, which is an array of JSONValues.
 */
export type JSONArray = Array<JSONValue>;

/**
 * Represents the path to a specific property in the JSON structure.
 * The path can either be a string (dot-separated for nested properties)
 * or an array of strings (for nested keys).
 */
export type Path = string | ReadonlyArray<string>;

/**
 * Represents a change to be applied to a JSON structure.
 * Each change includes a `path` to the property to modify, and a `value` to be set (or `undefined` for deletions).
 */
export type Change = {
  path: Path;
  value: JSONValue | undefined;
};

/**
 * Applies a series of changes to an initial JSON object or array.
 * The changes are applied sequentially to create a new mutated JSON structure.
 * Nested changes are supported, and the function ensures the original structure is not mutated.
 *
 * @param initialJson The initial JSON object or array that will be modified.
 * @param changes One or more changes to apply. A change consists of a `path` and a `value`.
 *
 * @returns A new JSON structure with the applied changes.
 */
export const applyChanges = (
  initialJson: JSONArray | JSONObject,
  ...changes: ReadonlyArray<Change | ReadonlyArray<Change>>
): JSONArray | JSONObject =>
  [changes] // Wrap the changes in an array to normalize the input structure
    .flat(2) // Flatten the array of changes (in case of nested arrays)
    .reduce(
      (newObj, change) => applyChangeMutate(newObj, change), // Apply each change sequentially
      cloneDeep(initialJson) // Deep clone the initial JSON to avoid mutating the original
    );

/**
 * Applies a single change to a JSON structure.
 * This function mutates the passed JSON object or array based on the change.
 *
 * @param initialJson The JSON structure to mutate (either an object or an array).
 * @param change The change to apply, which includes the path to modify and the new value.
 *
 * @returns The mutated JSON structure.
 */
const applyChangeMutate = (
  initialJson: JSONArray | JSONObject,
  change: Change
): JSONArray | JSONObject => {
  if (change.value === undefined) {
    deletePropertyPath(initialJson, change.path); // If the value is undefined, delete the property
  } else {
    set(initialJson, change.path, change.value); // Otherwise, set the new value at the specified path
  }

  return initialJson;
};

/**
 * Deletes a property or element at the specified path within the given JSON structure.
 * The path can represent a nested structure (e.g., 'user.address.city').
 *
 * @param obj The JSON object or array to modify.
 * @param path The path to the property to delete, which can be a string (dot-separated) or an array of keys.
 */
const deletePropertyPath = (obj: JSONArray | JSONObject, path: Path): void => {
  if (!obj || !path || !has(obj, path)) {
    return; // If the object is undefined, path is invalid, or the property doesn't exist, do nothing
  }

  const pathArray = typeof path === 'string' ? path.split('.') : path; // Convert string path to array if necessary
  const lastPathSegment = pathArray[pathArray.length - 1]; // The final segment of the path (property or array index)

  // Get the target object by slicing off the last path segment
  const targetObj =
    pathArray.length === 1 ? obj : get(obj, pathArray.slice(0, -1));

  // If the target is an array, call deleteArrayElement; otherwise, delete the property
  if (Array.isArray(targetObj)) {
    deleteArrayElement(targetObj, lastPathSegment);
  } else {
    delete targetObj[lastPathSegment];
  }
};

/**
 * Deletes an element from an array at the specified index (parsed from the last path segment).
 * This function is only called when the target object is an array.
 *
 * @param arr The array from which to delete an element.
 * @param lastPathSegment The last segment of the path, which should be a string representing the index.
 */
const deleteArrayElement = (arr: JSONArray, lastPathSegment: string): void => {
  const index = parseInt(lastPathSegment, 10); // Parse the index from the string path segment
  if (isNaN(index)) {
    return; // If the index is invalid (NaN), do nothing
  }
  arr.splice(index, 1); // Remove the element at the specified index
};
