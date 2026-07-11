// jsdom is missing several browser APIs that Radix primitives and the motion
// components rely on. Stub just enough for a render to succeed.

class IntersectionObserverStub {
  constructor(_cb: IntersectionObserverCallback) {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.assign(globalThis, {
  IntersectionObserver: IntersectionObserverStub,
  ResizeObserver: ResizeObserverStub,
})

window.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia

// Radix pointer handling
window.HTMLElement.prototype.hasPointerCapture ??= () => false
window.HTMLElement.prototype.setPointerCapture ??= () => {}
window.HTMLElement.prototype.releasePointerCapture ??= () => {}
window.HTMLElement.prototype.scrollIntoView ??= () => {}
