import {Map as IMap, List as IList} from "immutable";
import * as actionTypes from "./action-types";

////////////////////////////////////////////////////////////////////////////////
// root reducer

// FIXME: switch to use combineReducers?
// http://redux.js.org/docs/api/combineReducers.html

export function rootReducer (state = IMap(), action) {
  let foo = state.get("showAboutScreen", undefined);
  return state.merge({
    showAboutScreen: aboutReducer(foo, action),
    entities: addEntityReducer(state.get("entities"), action),
  })
  return state;
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

export function aboutReducer(state = defaultState.showAboutScreen, {type}) {
  switch (type) {
    case actionTypes.TOGGLE_ABOUT:
      let newState = Object.assign({}, state);
      newState.showAboutScreen = !newState.showAboutScreen;
      return newState;
    default:
      return state;
  }
}

export function addEntityReducer(state = defaultState.entities, action) {
  let {type, entityType, id, data} = action;

  switch (type) {
    case actionTypes.ADD_ENTITY:
      if (! state.has(entityType)) {
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
