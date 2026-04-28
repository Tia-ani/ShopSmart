import '@testing-library/jest-dom'

if (typeof globalThis.IntersectionObserver === 'undefined') {
	class MockIntersectionObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords() {
			return []
		}
	}

	globalThis.IntersectionObserver = MockIntersectionObserver
}
