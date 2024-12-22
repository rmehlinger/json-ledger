import { applyChanges, Change, JSONValue } from '../src';

describe('applyChanges', () => {
  it('should work on empty objects', () => {
    const emptyObj = {};
    expect(applyChanges(emptyObj, { path: 'a', value: 1 })).toEqual({ a: 1 });
    expect(applyChanges(emptyObj, { path: 'a.b.c.d', value: 1 })).toEqual({
      a: { b: { c: { d: 1 } } },
    });
    expect(emptyObj).toEqual({});
  });
  // Test: Apply 'create' operation (set a new value)
  it('should create new properties', () => {
    const initialJson: JSONValue = { name: 'Alice' };
    const changes: Change[] = [{ path: 'age', value: 30 }];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  // Test: Apply 'set' operation (update an existing value)
  it('should set values', () => {
    const initialJson: JSONValue = { name: 'Alice', age: 30 };
    const changes: Change[] = [{ path: 'age', value: 31 }];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({ name: 'Alice', age: 31 });
    expect(initialJson).toEqual({ name: 'Alice', age: 30 });
  });

  // Test: Apply 'delete' operation (remove a property)
  it('should delete properties', () => {
    const initialJson: JSONValue = { name: 'Alice', age: 30 };
    const changes: Change[] = [{ path: 'age', value: undefined }];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({ name: 'Alice' });
    expect(initialJson).toEqual({ name: 'Alice', age: 30 });
  });

  // Test: Apply multiple changes
  it('should apply multiple changes in sequence', () => {
    const initialJson: JSONValue = { name: 'Alice', age: 30 };
    const changes: Change[] = [
      { path: 'age', value: 31 },
      { path: 'address', value: 'Wonderland' },
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({ name: 'Alice', age: 31, address: 'Wonderland' });
    expect(initialJson).toEqual({ name: 'Alice', age: 30 });
  });

  // Test: Nested objects
  it('should handle changes to nested objects', () => {
    const initialJson: JSONValue = { person: { name: 'Alice', age: 30 } };
    const changes: Change[] = [{ path: 'person.age', value: 31 }];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({ person: { name: 'Alice', age: 31 } });
    expect(initialJson).toEqual({ person: { name: 'Alice', age: 30 } });
  });

  // Test: Deep delete operation
  it('should delete nested properties', () => {
    const initialJson: JSONValue = { person: { name: 'Alice', age: 30 } };
    const changes: Change[] = [{ path: 'person.age', value: undefined }];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({ person: { name: 'Alice' } });
    expect(initialJson).toEqual({ person: { name: 'Alice', age: 30 } });
  });

  // Test: Handling an empty change array
  it('should return the initial object when no changes are provided', () => {
    const initialJson: JSONValue = { name: 'Alice' };
    const changes: Change[] = [];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({ name: 'Alice' });
    expect(initialJson).toEqual({ name: 'Alice' });
  });

  // Test: Handling a nested delete
  it('should delete a deeply nested property', () => {
    const initialJson: JSONValue = {
      user: { profile: { name: 'Alice', age: 30 } },
    };
    const changes: Change[] = [{ path: 'user.profile.age', value: undefined }];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({
      user: { profile: { name: 'Alice' } },
    });
    expect(initialJson).toEqual({
      user: { profile: { name: 'Alice', age: 30 } },
    });
  });

  // Test: Handling arrays with changes
  it('should apply changes to arrays', () => {
    const initialJson: JSONValue = ['apple', 'banana', 'cherry'];
    const changes: Change[] = [{ path: '1', value: 'blueberry' }];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual(['apple', 'blueberry', 'cherry']);
  });

  // Test: Handling delete operation in arrays
  it('should delete array elements', () => {
    const initialJson: JSONValue = ['apple', 'banana', 'cherry'];
    const changes: Change[] = [{ path: '1', value: undefined }];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual(['apple', 'cherry']);
  });

  // Test: Handling empty path on delete (invalid path)
  it('should not mutate if an invalid path is provided for deletion', () => {
    const initialJson: JSONValue = { name: 'Alice' };
    const changes: Change[] = [{ path: '', value: undefined }];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({ name: 'Alice' }); // Nothing should change
  });

  // Test: Deep path for array and object mixed
  it('should handle deep paths in mixed object and array structures', () => {
    const initialJson: JSONValue = {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    };
    const changes: Change[] = [
      { path: 'users.1.name', value: 'Charlie' },
      { path: 'users.0.id', value: 10 },
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({
      users: [
        { id: 10, name: 'Alice' },
        { id: 2, name: 'Charlie' },
      ],
    });
  });

  // Test: Empty object array should remain unchanged
  it('should leave empty objects and arrays unchanged', () => {
    const initialJson: JSONValue = [];
    const changes: Change[] = [{ path: '0', value: 'apple' }];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual(['apple']);
  });
  // Test: Array inside an array
  it('should handle arrays nested inside arrays', () => {
    const initialJson: JSONValue = [
      ['apple', 'banana'],
      ['cherry', 'date'],
    ];
    const changes: Change[] = [
      { path: '0.1', value: 'blueberry' }, // Change 'banana' to 'blueberry'
      { path: '1.0', value: 'grape' }, // Change 'cherry' to 'grape'
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual([
      ['apple', 'blueberry'],
      ['grape', 'date'],
    ]);
  });

  // Test: Object inside an array
  it('should handle objects inside arrays', () => {
    const initialJson: JSONValue = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    const changes: Change[] = [
      { path: '0.name', value: 'Alicia' }, // Change 'Alice' to 'Alicia'
      { path: '1.id', value: 3 }, // Change id of Bob to 3
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual([
      { id: 1, name: 'Alicia' },
      { id: 3, name: 'Bob' },
    ]);
  });

  // Test: Array inside an object
  it('should handle arrays nested inside objects', () => {
    const initialJson: JSONValue = {
      users: [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
      active: true,
    };
    const changes: Change[] = [
      { path: 'users.0.name', value: 'Alicia' }, // Change Alice to Alicia
      { path: 'users.1.id', value: 3 }, // Change Bob's id to 3
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({
      users: [
        { id: 1, name: 'Alicia' },
        { id: 3, name: 'Bob' },
      ],
      active: true,
    });
  });

  // Test: Object inside an array with nested arrays
  it('should handle objects inside arrays with nested arrays', () => {
    const initialJson: JSONValue = [
      { id: 1, name: 'Alice', hobbies: ['reading', 'painting'] },
      { id: 2, name: 'Bob', hobbies: ['cycling', 'gaming'] },
    ];
    const changes: Change[] = [
      { path: '0.hobbies.1', value: 'drawing' }, // Change 'painting' to 'drawing'
      { path: '1.hobbies.0', value: 'swimming' }, // Change 'cycling' to 'swimming'
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual([
      { id: 1, name: 'Alice', hobbies: ['reading', 'drawing'] },
      { id: 2, name: 'Bob', hobbies: ['swimming', 'gaming'] },
    ]);
  });

  // Test: Array inside an object with a delete operation
  it('should handle array inside an object with a delete operation', () => {
    const initialJson: JSONValue = {
      users: [
        { id: 1, name: 'Alice', age: 30 },
        { id: 2, name: 'Bob', age: 25 },
      ],
    };
    const changes: Change[] = [
      { path: 'users.1.age', value: undefined }, // Delete 'age' for Bob
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({
      users: [
        { id: 1, name: 'Alice', age: 30 },
        { id: 2, name: 'Bob' },
      ],
    });
  });

  // Test: Array of arrays, deleting a nested array element
  it('should handle array of arrays, deleting an element from a nested array', () => {
    const initialJson: JSONValue = [
      ['apple', 'banana', 'cherry'],
      ['date', 'elderberry', 'fig'],
    ];
    const changes: Change[] = [
      { path: '0.1', value: undefined }, // Delete 'banana' from the first array
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual([
      ['apple', 'cherry'],
      ['date', 'elderberry', 'fig'],
    ]);
  });

  // Test: Deeply nested object inside an array
  it('should handle a deeply nested object inside an array', () => {
    const initialJson: JSONValue = [
      { user: { name: 'Alice', address: { city: 'Wonderland' } } },
      { user: { name: 'Bob', address: { city: 'Builderland' } } },
    ];
    const changes: Change[] = [
      { path: '0.user.address.city', value: 'AliciaLand' }, // Change Alice's city
      { path: '1.user.name', value: 'Robert' }, // Change Bob's name
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual([
      { user: { name: 'Alice', address: { city: 'AliciaLand' } } },
      { user: { name: 'Robert', address: { city: 'Builderland' } } },
    ]);
  });

  // Test: Nested arrays and objects with multiple changes
  it('should handle mixed changes with nested arrays and objects', () => {
    const initialJson: JSONValue = {
      users: [
        { id: 1, name: 'Alice', skills: ['JavaScript', 'TypeScript'] },
        { id: 2, name: 'Bob', skills: ['Python', 'Go'] },
      ],
      active: true,
    };
    const changes: Change[] = [
      { path: 'users.0.skills.0', value: 'Java' }, // Change 'JavaScript' to 'Java'
      { path: 'users.1.skills.1', value: 'Rust' }, // Change 'Go' to 'Rust'
      { path: 'users.1.name', value: 'Bobby' }, // Change Bob's name to 'Bobby'
      { path: 'active', value: false }, // Change 'active' status
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual({
      users: [
        { id: 1, name: 'Alice', skills: ['Java', 'TypeScript'] },
        { id: 2, name: 'Bobby', skills: ['Python', 'Rust'] },
      ],
      active: false,
    });
  });

  // Test: Array inside array, delete nested element
  it('should handle deleting a nested array element in an array inside another array', () => {
    const initialJson: JSONValue = [
      ['apple', 'banana', 'cherry'],
      ['date', 'elderberry', 'fig'],
    ];
    const changes: Change[] = [
      { path: '0.0', value: undefined }, // Delete 'apple' from the first array
    ];

    const result = applyChanges(initialJson, ...changes);

    expect(result).toEqual([
      ['banana', 'cherry'],
      ['date', 'elderberry', 'fig'],
    ]);
  });
});
