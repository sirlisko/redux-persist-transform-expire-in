import { createTransform, type Transform } from "redux-persist";

/**
 * Creates a transform that expires redux state after a specified time period.
 *
 * @template State - The type of state being transformed
 * @param {number} expireIn - Time in milliseconds until the state expires
 * @param {string} [expireKey="persistencyExpiration"] - Key used in localStorage to track expiration
 * @param {State} [defaultValue={}] - Value to which state will reset when expired
 * @returns {Transform<State, State>} A redux-persist transform
 *
 * @example
 * // State expires after 24 hours
 * const expireTransform = transformExpire<RootState>(
 *   24 * 60 * 60 * 1000,
 *   "myApp.expiration",
 *   { user: null, settings: defaultSettings }
 * );
 */
const transformExpire = <State = Record<string, unknown>>(
	expireIn: number,
	expireKey = "persistencyExpiration",
	defaultValue: State = {} as State,
): Transform<State, State> => {
	let expired = false;

	try {
		const storedExpiration = localStorage.getItem(expireKey);
		if (storedExpiration) {
			const expirationTime = Number.parseInt(storedExpiration, 10);
			const now = new Date().getTime();
			expired = !Number.isNaN(expirationTime) && now > expirationTime;
		}
	} catch {}

	return createTransform(
		// inbound (state → storage)
		(inboundState: State): State => {
			// Schedule expiration time update for next tick
			setTimeout((): void => {
				try {
					const expireValue = (new Date().getTime() + expireIn).toString();
					localStorage.setItem(expireKey, expireValue);
				} catch {}
			}, 0);

			return inboundState;
		},
		// outbound (storage → state)
		(outboundState: State): State => (expired ? defaultValue : outboundState),
	);
};

export default transformExpire;
