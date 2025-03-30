# redux-persist-transform-expire-in [![npm][npm-image]][npm-url] [![Coverage Status][coverage-image]][coverage-url]

> A `redux-persist` transform that expires persisted redux data after a specified period of time.

This transform automatically manages expiration of your Redux state. It creates an entry in localStorage with the expiration timestamp for your persisted state.

**Key features:**

- Expire persisted Redux state after a configurable time period
- Updates expiration timestamp on each state update
- TypeScript support with generics for type safety
- Simple integration with redux-persist

See a live demo at [https://codesandbox.io/s/redux-persist-transform-expire-in-lmj74q](https://codesandbox.io/s/redux-persist-transform-expire-in-lmj74q).

## Install

```bash
npm install redux-persist-transform-expire-in
```

## Example

```ts
import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import expireInTransform from "redux-persist-transform-expire-in";

interface RootState {
  user: {
    id: string | null;
    name: string | null;
  };
  settings: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

const initialState: RootState = {
  user: { id: null, name: null },
  settings: { theme: "light", notifications: true },
};

const rootReducer = (state = initialState, action): RootState => {
  // your reducer logic
  return state;
};

// Expire persisted state after 7 days
const expireIn = 7 * 24 * 60 * 60 * 1000;
const expirationKey = "myApp.expiration";

const persistConfig = {
  key: "root",
  storage,
  transforms: [
    expireInTransform<RootState>(expireIn, expirationKey, initialState),
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = createStore(persistedReducer);
export const persistor = persistStore(store);
```

## How It Works

1. When the transform is initialized, it checks localStorage for any existing expiration timestamp
2. If an expiration timestamp exists and is in the past, the outbound transform returns the default state
3. Each time the state is updated, the transform resets the expiration timestamp to the current time + expireIn
4. This approach ensures that frequently used apps won't expire, while inactive apps will reset after the specified period

## Configuration Options

| Parameter     | Type   | Default                 | Description                                            |
| ------------- | ------ | ----------------------- | ------------------------------------------------------ |
| expireIn      | number | (required)              | Time in milliseconds until the state expires           |
| expirationKey | string | 'persistencyExpiration' | Key used in localStorage to store expiration timestamp |
| defaultValue  | any    | {}                      | Value to reset state to when expired                   |

## Difference with `redux-persist-transform-expire`

Unlike [`redux-persist-transform-expire`](https://github.com/gabceb/redux-persist-transform-expire), which requires you to add a specific `expireAt` key to your reducers. `redux-persist-transform-expire-in` works with your entire persisted state and there is no need to modify your reducers to include expiration logic.

[npm-image]: https://img.shields.io/npm/v/redux-persist-transform-expire-in.svg
[npm-url]: https://npmjs.com/package/redux-persist-transform-expire-in
[coverage-image]: https://codecov.io/gh/sirLisko/redux-persist-transform-expire-in/branch/main/graph/badge.svg?token=meelllHB2x
[coverage-url]: https://codecov.io/gh/sirLisko/redux-persist-transform-expire-in
