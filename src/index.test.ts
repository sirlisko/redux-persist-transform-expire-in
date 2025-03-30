import expireIn from "./index";
import mockdate from "mockdate";

import reduxPersist from "redux-persist";
jest.mock("redux-persist", () => ({
	createTransform: jest.fn(),
}));

const oneDay = 24 * 60 * 60 * 1000;

describe("redux-persist-transform-expire-in", () => {
	beforeEach(() => {
		mockdate.set("1/1/2000");
	});

	const createTransformMock = jest.spyOn(
		reduxPersist,
		"createTransform",
		// biome-ignore lint/suspicious/noExplicitAny: keep the test simple
	) as any;
	createTransformMock.mockImplementation(() => {});

	afterEach(() => {
		createTransformMock.mockReset();
		mockdate.reset();
		localStorage.removeItem("persistencyExpiration");
		localStorage.removeItem("exp");
	});

	it("should write the expiration time in the localStorage", (done) => {
		expireIn(oneDay, "exp");
		expect(createTransformMock.mock.calls[0][0]({ foo: "bar" })).toEqual({
			foo: "bar",
		});
		setTimeout(() => {
			expect(Number(localStorage.getItem("exp"))).toBe(
				new Date(2000, 0, 2).getTime(),
			);
			done();
		}, 1);
		expect(createTransformMock).toHaveBeenCalled();
	});

	it("should return the state if not expiration token present", () => {
		expireIn(oneDay);
		expect(createTransformMock).toHaveBeenCalled();
		expect(createTransformMock.mock.calls[0][1]({ foo: "bar" })).toEqual({
			foo: "bar",
		});
	});

	it("should return the state if expiration token is NaN", () => {
		localStorage.setItem("persistencyExpiration", "foobar");
		expireIn(oneDay);
		expect(createTransformMock).toHaveBeenCalled();
		expect(createTransformMock.mock.calls[0][1]({ foo: "bar" })).toEqual({
			foo: "bar",
		});
	});

	it("should return the state if not expired", () => {
		localStorage.setItem(
			"persistencyExpiration",
			(new Date().getTime() + oneDay).toString(),
		);
		expireIn(oneDay);
		expect(createTransformMock).toHaveBeenCalled();
		expect(createTransformMock.mock.calls[0][1]({ foo: "bar" })).toEqual({
			foo: "bar",
		});
	});

	it("should not return the state if expired", () => {
		localStorage.setItem(
			"persistencyExpiration",
			new Date().getTime().toString(),
		);
		mockdate.set("1/3/2000");
		expireIn(oneDay);
		expect(createTransformMock).toHaveBeenCalled();
		expect(createTransformMock.mock.calls[0][1]({ foo: "bar" })).toEqual({});
	});

	it("should return default the state if expired", () => {
		localStorage.setItem(
			"persistencyExpiration",
			new Date().getTime().toString(),
		);
		mockdate.set("1/3/2000");
		expireIn(oneDay, "persistencyExpiration", []);
		expect(createTransformMock).toHaveBeenCalled();
		expect(createTransformMock.mock.calls[0][1]({ foo: "bar" })).toEqual([]);
	});
});
