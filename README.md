# json-ledger

`json-ledger` is a lightweight JavaScript/TypeScript package designed to efficiently apply a series of changes to JSON objects and arrays. It provides utility functions to update, delete, or modify JSON data structures in a non-mutating and type-safe way.

## Features

- **Immutable by default:** The original JSON object or array is never mutated. Changes are applied to a deep clone of the input.
- **Path-based updates:** Supports dot-separated string paths or arrays of strings for deeply nested properties.
- **Deletion support:** Delete properties or array elements by specifying their path.
- **Type safety:** Fully typed in TypeScript for safer and more predictable usage.
- **Compatibility:** Built on top of `es-toolkit` for compatibility and utility functions.

## Installation

```bash
npm install json-ledger
```

## Usage

### Basic Example

```typescript
import { applyChanges } from 'json-ledger';

const initialJson = {
  user: {
    name: 'Alice',
    address: {
      city: 'Wonderland',
      zip: '12345',
    },
  },
};

const changes = [
  { path: 'user.name', value: 'Bob' },
  { path: 'user.address.zip', value: '54321' },
  { path: 'user.phone', value: '123-456-7890' },
  { path: 'user.address.city', value: undefined }, // Deletes the city property
];

const updatedJson = applyChanges(initialJson, changes);

console.log(updatedJson);
```

**Output:**

```json
{
  "user": {
    "name": "Bob",
    "address": {
      "zip": "54321"
    },
    "phone": "123-456-7890"
  }
}
```

### Advanced Example: Working with Arrays

```typescript
const initialJson = {
  items: [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ],
};

const changes = [
  { path: 'items.1.name', value: 'Updated Item 2' }, // Update the second item
  { path: 'items.2', value: undefined }, // Delete the third item
];

const updatedJson = applyChanges(initialJson, changes);

console.log(updatedJson);
```

**Output:**

```json
{
  "items": [
    { "id": 1, "name": "Item 1" },
    { "id": 2, "name": "Updated Item 2" }
  ]
}
```

## API

### `applyChanges`

#### Parameters:

- **`initialJson`** (`JSONArray | JSONObject`): The JSON object or array to apply changes to.
- **`changes`** (`ReadonlyArray<Change | ReadonlyArray<Change>>`): One or more changes to apply.

#### Returns:

- A new JSON object or array with the applied changes.

### Change Type

A `Change` object has the following structure:

```typescript
type Change = {
  path: Path; // Path to the property or array element to modify
  value: JSONValue | undefined; // New value to set, or undefined to delete the property/element
};
```

### `Path`

- A `Path` can be either:
  - A dot-separated string (e.g., `'user.address.city'`)
  - An array of strings (e.g., `['user', 'address', 'city']`)

### `JSONValue`

A `JSONValue` can be any of the following:

- `string`
- `number`
- `boolean`
- `null`
- `JSONObject`
- `JSONArray`

### Utility Functions

#### `set`

Sets a value at a specified path within a JSON object or array.

#### `get`

Retrieves a value from a specified path within a JSON object or array.

#### `has`

Checks if a property or element exists at a specified path.

#### `deletePropertyPath`

Deletes a property or element at a specified path within a JSON object or array.

## Contributing

Contributions are welcome! Please follow the standard GitHub flow:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
