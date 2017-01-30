import {Map as IMap, List as IList} from "immutable";
import * as actionTypes from "./action-types";

// This tells redux-storage-decorator-immutablejs which bits of the
// state tree to make immutable.
export const STRUCTURE = [
  ['showAboutScreen'],
  ['entities'],
];

////////////////////////////////////////////////////////////////////////////////
// root reducer

// FIXME: switch to use combineReducers?
// http://redux.js.org/docs/api/combineReducers.html

export function rootReducer (state = IMap(), action) {
  return state.merge({
    showAboutScreen: aboutReducer(state.get("showAboutScreen", undefined),
                                  action),
    entities: addEntityReducer(state.get("entities"), action),
  })
}

////////////////////////////////////////////////////////////////////////////////
// accountsy stuff

// const defaultState = IMap({
//   showAboutScreen: false,
// });

const defaultState = {
  showAboutScreen: false,
  entities: {
    people: {},
    organisations: {},
    "government-offices": {},
  },
};

function aboutReducer(state = defaultState.showAboutScreen, {type}) {
  switch (type) {
    case actionTypes.TOGGLE_ABOUT:
      return !state;
    default:
      return state;
  }
}

function addEntityReducer(state = defaultState.entities, action) {
  let {type, entityType, id, data} = action;

  switch (type) {
    case actionTypes.ADD_ENTITY:
      if (!state.has(entityType)) {
        console.error(`Received ADD_ENTITY action with invalid entity type ${entityType}`);
        return state;
      }
      return state.mergeDeep({
        [entityType]: {
          [id]: data
        },
      });
    default:
      return state;
  }
}
