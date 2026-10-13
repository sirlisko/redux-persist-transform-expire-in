import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";
import expireIn from "./index.ts";

const oneDay = 24 * 60 * 60 * 1000;
const state = { foo: "bar" };

const storage = new Map<string, string>();
const localStorageStub = {
	getItem: (key: string) => storage.get(key) ?? null,
	setItem: (key: string, value: string) => storage.set(key, value),
};

const setLocalStorage = (value: unknown) =>
	Object.defineProperty(globalThis, "localStorage", {
		value,
		configurable: true,
	});

describe("redux-persist-transform-expire-in", () => {
	beforeEach(() => {
		setLocalStorage(localStorageStub);
		mock.timers.enable({
			apis: ["Date", "setTimeout"],
			now: new Date(2000, 0, 1),
		});
	});

	afterEach(() => {
		mock.timers.reset();
		storage.clear();
	});

	it("writes the expiration time on inbound", () => {
		const transform = expireIn(oneDay, "exp");
		assert.deepEqual(transform.in(state, "root", state), state);

		mock.timers.tick(0);
		assert.equal(Number(storage.get("exp")), new Date(2000, 0, 2).getTime());
	});

	it("returns the state when there is no expiration", () => {
		assert.deepEqual(expireIn(oneDay).out(state, "root", state), state);
	});

	it("returns the state when the expiration is not a number", () => {
		storage.set("persistencyExpiration", "foobar");
		assert.deepEqual(expireIn(oneDay).out(state, "root", state), state);
	});

	it("returns the state when not expired", () => {
		storage.set("persistencyExpiration", String(Date.now() + oneDay));
		assert.deepEqual(expireIn(oneDay).out(state, "root", state), state);
	});

	it("returns an empty object when expired", () => {
		storage.set("persistencyExpiration", String(Date.now()));
		mock.timers.setTime(new Date(2000, 0, 3).getTime());
		assert.deepEqual(expireIn(oneDay).out(state, "root", state), {});
	});

	it("returns the default value when expired", () => {
		storage.set("persistencyExpiration", String(Date.now()));
		mock.timers.setTime(new Date(2000, 0, 3).getTime());
		const transform = expireIn<unknown>(oneDay, "persistencyExpiration", []);
		assert.deepEqual(transform.out(state, "root", state), []);
	});

	it("keeps the state when localStorage is unavailable", () => {
		const throws = () => {
			throw new Error("SecurityError");
		};
		setLocalStorage({ getItem: throws, setItem: throws });

		const transform = expireIn(oneDay);
		assert.deepEqual(transform.out(state, "root", state), state);
		assert.deepEqual(transform.in(state, "root", state), state);
		assert.doesNotThrow(() => mock.timers.tick(0));
	});
});
