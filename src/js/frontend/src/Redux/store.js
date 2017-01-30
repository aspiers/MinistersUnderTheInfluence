import {createStore, applyMiddleware} from "redux"
import thunkMiddleware from "redux-thunk"
import createLogger from 'redux-logger'
import {rootReducer, STRUCTURE} from "./reducer"
import * as storage from "redux-storage"
import createEngine from "redux-storage-engine-localstorage"
import storageDebounce from 'redux-storage-decorator-debounce'
import merger from 'redux-storage-merger-immutablejs'
import immutablejs from 'redux-storage-decorator-immutablejs'

////////////////////////////////////////////////////////////////////////////////
// redux stuff

// wrap our main reducer in a storage reducer - this intercepts LOAD actions and
// calls the merger function to merge in the new state
const reducer = storage.reducer(rootReducer, merger)

// create a storage engine, with decorators to convert plain JS into Immutable
// and "debounce" storage so it's not happening all the time
let engine = createEngine("muti-frontend");
engine = storageDebounce(engine, 2000);
engine = immutablejs(engine, STRUCTURE);

// create storage middleware, which triggers a save action after every normal action
const storageMiddleware = storage.createMiddleware(engine)
// create logger middleware
const loggerMiddleware = createLogger({
  //stateTransformer: (state) => state.toJS ? state.toJS() : state,
  // you can filter out certain actions from logging
  //predicate: (getState, action) => action.type !== CALCULATION_NEEDS_REFRESH
})

// now create our redux store, applying all our middleware
const createStoreWithMiddleware = applyMiddleware(
//  thunkMiddleware, // first, so function results get transformed
  loggerMiddleware, // now log everything at this state
  storageMiddleware // finally the storage middleware
)
// https://github.com/zalmoxisus/redux-devtools-extension
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// const composeEnhancers =
//     process.env.NODE_ENV !== 'production' &&
//     typeof window === 'object' &&
//     window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
//       window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
//         // Specify extension’s options like name, actionsBlacklist, actionsCreators or immutablejs support
//       }) : compose;

const initialState = {
  showAboutScreen: false,
  entities: {
    dogs: {}
  }
};

const store = createStore(
  reducer,
  initialState,
  composeEnhancers(createStoreWithMiddleware)
);

module.exports = {store, engine};
