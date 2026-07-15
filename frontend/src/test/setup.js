import '@testing-library/jest-dom';

// Node >= 22 define un localStorage global experimental que queda undefined
// sin --localstorage-file y pisa el de jsdom. Stub en memoria para tests.
if (globalThis.localStorage === undefined) {
  let store = {};
  const localStorageStub = {
    getItem: key => (key in store ? store[key] : null),
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: key => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageStub,
    writable: true,
    configurable: true,
  });
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageStub,
      writable: true,
      configurable: true,
    });
  }
}
