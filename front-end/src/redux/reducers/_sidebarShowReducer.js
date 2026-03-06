const INITIAL_STATE = "responsive";

export default function _sidebarshowReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "set":
      return action.sidebarShow;

    default:
      return state;
  }
}
