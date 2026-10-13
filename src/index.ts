import { createTransform, type Transform } from "redux-persist";

/**
 * Creates a transform that resets persisted state after a period of inactivity.
 *
 * redux-persist applies transforms per top-level key, so `defaultValue`
 * replaces each persisted slice, not the whole state.
 *
 * @template State - The type of each persisted slice
 * @param {number} expireIn - Inactivity, in milliseconds, before the state expires
 * @param {string} [expireKey="persistencyExpiration"] - localStorage key that stores the expiry timestamp
 * @param {State} [defaultValue={}] - Value each slice is replaced with once expired
 * @returns {Transform<State, State>} A redux-persist transform
 *
 * @example
 * // Pair with autoMergeLevel2 so expired slices fall back to their initial state
 * const persistConfig = {
 *   key: "root",
 *   storage,
 *   stateReconciler: autoMergeLevel2,
 *   transforms: [transformExpire(24 * 60 * 60 * 1000)],
 * };
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
			const now = Date.now();
			expired = !Number.isNaN(expirationTime) && now > expirationTime;
		}
	} catch {}

	return createTransform(
		// inbound (state → storage)
		(inboundState: State): State => {
			// Schedule expiration time update for next tick
			setTimeout((): void => {
				try {
					const expireValue = (Date.now() + expireIn).toString();
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
