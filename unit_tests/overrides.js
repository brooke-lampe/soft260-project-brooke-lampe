class AssertionError extends Error {}

const builtinAssert = console.assert;

console.assert = function assert(assertion, text = 'Assertion Error') {
  builtinAssert(assertion, text);
  if (!assertion) {
    throw new AssertionError(text);
  }
};
