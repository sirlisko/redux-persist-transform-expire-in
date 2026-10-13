# redux-persist-transform-expire-in

[![npm][npm-image]][npm-url] [![license][license-image]][license-url]

A [`redux-persist`](https://github.com/rt2zz/redux-persist) transform that resets persisted state after a period of inactivity.

- **No reducer changes.** Works on the whole persisted state, with no `expireAt` keys to add.
- **Sliding expiry.** Every write pushes the deadline forward, so only inactive users get a reset.
- **Tiny.** One function, no dependencies.
- **Typed.** TypeScript declarations included.

## Install

```bash
npm install redux-persist-transform-expire-in
```

## Usage

```ts
import { persistReducer } from "redux-persist";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "redux-persist/lib/storage";
import expireIn from "redux-persist-transform-expire-in";

const sevenDays = 7 * 24 * 60 * 60 * 1000;

const persistConfig = {
  key: "root",
  storage,
  stateReconciler: autoMergeLevel2,
  transforms: [expireIn(sevenDays)],
};

export const persistedReducer = persistReducer<ReturnType<typeof rootReducer>>(
  persistConfig,
  rootReducer,
);
```

If nothing has been persisted for seven days, the app starts from your reducers' initial state.

Passing the state type to `persistReducer` keeps it typed with Redux Toolkit 2, where TypeScript can't infer it.

### Why `autoMergeLevel2`

redux-persist runs transforms once per top-level key of your state, so on expiry every slice is replaced with `defaultValue` (`{}` by default). `autoMergeLevel2` merges that `{}` into each slice's initial state, which is a clean reset. With the default `autoMergeLevel1`, each slice is replaced by `{}` and loses its initial values.

## API

```ts
expireIn<State>(expireIn: number, expireKey?: string, defaultValue?: State)
```

| Parameter      | Default                   | Description                                                   |
| -------------- | ------------------------- | ------------------------------------------------------------- |
| `expireIn`     | required                  | Inactivity, in milliseconds, before the state expires         |
| `expireKey`    | `"persistencyExpiration"` | `localStorage` key that stores the expiry timestamp           |
| `defaultValue` | `{}`                      | Value each persisted slice is replaced with once expired      |

Use a different `expireKey` for each persisted reducer that has its own expiry.

## How it works

1. When the transform is created, it reads the expiry timestamp from `localStorage`.
2. On rehydration, if that timestamp is in the past, each slice comes back as `defaultValue`.
3. Every time state is persisted, the timestamp moves to now + `expireIn`.

The timestamp lives in `localStorage`, whatever storage engine you persist to. Where `localStorage` is missing, as in React Native or during server rendering, the transform never expires anything and leaves state untouched.

## Compared to `redux-persist-transform-expire`

[`redux-persist-transform-expire`](https://github.com/gabceb/redux-persist-transform-expire) expires individual reducers through an `expireAt` key you add to their state. This package expires the whole persisted state and needs no reducer changes.

## Maintenance

The package is feature-complete. It is maintained for bug fixes and compatibility with new versions of redux-persist, and dependency updates land monthly. Changes are listed in the [releases](https://github.com/sirlisko/redux-persist-transform-expire-in/releases).

[npm-image]: https://img.shields.io/npm/v/redux-persist-transform-expire-in.svg
[npm-url]: https://npmjs.com/package/redux-persist-transform-expire-in
[license-image]: https://img.shields.io/npm/l/redux-persist-transform-expire-in.svg
[license-url]: https://github.com/sirlisko/redux-persist-transform-expire-in/blob/main/LICENSE
