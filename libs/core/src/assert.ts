const assert = (condition: boolean, message: string = 'Assertion failed') => {
    console.assert(condition, message);
  }

assert.strictEqual = <T>(actual: T, expected: T, message: string = 'Values are not strictly equal') => {
  console.assert(actual === expected, message);
}

export default assert;

