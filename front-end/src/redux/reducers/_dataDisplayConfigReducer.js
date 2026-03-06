import { SET_DISPLAY_COMPONENTS } from '../actions/action-types';

const INITIAL_STATE = {
  components: [
    { name: "condição", code: "condition", status: true },
    { name: "categoria do anúncio", code: "advert_type", status: true },
    { name: "frete", code: "free_shipping", status: true },
    { name: "status", code: "status", status: true },
    { name: "vendido", code: "sold_quantity", status: true },
    { name: "disponível", code: "available_quantity", status: true }
  ],
};

function componentsWillUpdate({ action, state }) {
  return state.components.filter(x => !action.payload.includes(x.name));
}
function componentsWontUpdate({ action, state }) {
  return state.components.filter(x => action.payload.includes(x.name));
}
function revertComponentStatus(component) {
  return Object.assign({}, component, { status: !component.status });
}
function newDisplayConfig({ state, wontUpdateList, updatedComponents }) {
  return Object.assign({}, state, { components: [...wontUpdateList, ...updatedComponents] });
}
function makeAllStatusTrue({ state }) {
  const components = state.components.map(object => Object.assign({}, object, { status: true }));
  return Object.assign({}, state, { components });
}

function handleUpdates({ state, action, willUpdateList }) {
  const wontUpdateList = componentsWontUpdate({ action, state });
  const updatedComponents = willUpdateList.map(object => revertComponentStatus(object));
  return newDisplayConfig({ state, wontUpdateList, updatedComponents });
}

function handleDisplayComponents({ state, action }) {
  const willUpdateList = componentsWillUpdate({ action, state });
  if (willUpdateList.length > 0) return handleUpdates({ state, action, willUpdateList });
  else return makeAllStatusTrue({ state });
}

export default function _dataDisplayConfigReducer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  if (action.type === SET_DISPLAY_COMPONENTS) {
    return handleDisplayComponents({ state, action });
  }

  return state;
};
