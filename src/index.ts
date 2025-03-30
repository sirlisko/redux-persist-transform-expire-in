import { createTransform } from "redux-persist";

/**
 * `redux-persist` transformer that reset the persisted redux state after a specific period of time.
 * @param {number} expireIn For how long the state is going to be preserved
 * @param {string} [expireKey="persistencyExpiration"] Key used by the localStorage
 * @param {any} defaultValue Value to which state will be cleared to
 */

const transformExpire = (
	expireIn: number,
	expireKey = "persistencyExpiration",
	defaultValue = {},
) => {
	// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
	let storedExpiration;
	try {
		storedExpiration = localStorage.getItem(expireKey);
	} catch (e) {}

	let expired = false;

	if (storedExpiration) {
		const expiring = Number.parseInt(storedExpiration);
		const now = new Date().getTime();
		expired = Boolean(expiring) && !Number.isNaN(expiring) && now > expiring;
	}

	return createTransform(
		(inboundState) => {
			setTimeout((): void => {
				const expireValue = (new Date().getTime() + expireIn).toString();
				try {
					localStorage.setItem(expireKey, expireValue);
				} catch (e) {}
			}, 0);

			return inboundState;
		},
		(outboundState) => (expired ? defaultValue : outboundState),
	);
};

export default transformExpire;
