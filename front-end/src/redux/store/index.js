import { applyMiddleware, createStore, compose } from "redux";
import Reducers from "../reducers/Reducers";
import thunk from "redux-thunk";

const middleware = applyMiddleware(thunk);

const composer =
  process.env.NODE_ENV === "development"
    ? createStore(
        Reducers,
        compose(
          middleware,
          console.tron.createEnhancer(),
          window.__REDUX_DEVTOOLS_EXTENSION__
            ? window.__REDUX_DEVTOOLS_EXTENSION__()
            : (f) => f
        )
      )
    : createStore(Reducers, middleware);

const store = composer;

export default store;
