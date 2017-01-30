import {combineReducers} from "redux";
import * as actionTypes from "./action-types";

// This tells redux-storage-decorator-immutablejs which bits of the
// state tree to make immutable.
export const STRUCTURE = [
  ['showAboutScreen'],
  ['entities'],
];

////////////////////////////////////////////////////////////////////////////////

const DEFAULT_ENTITIES = {
  people: {},
  organisations: {},
  "government-offices": {},
};

function aboutReducer(state = false, {type}) {
  switch (type) {
    case actionTypes.TOGGLE_ABOUT:
      return !state;
    default:
      return state;
  }
}

function addEntityReducer(state = DEFAULT_ENTITIES, action) {
  let {type, entityType, id, data} = action;

  switch (type) {
    case actionTypes.ADD_ENTITY:
      if (!state["entityType"]) {
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

export const rootReducer = combineReducers({
  showAboutScreen: aboutReducer,
  entities: addEntityReducer,
});
