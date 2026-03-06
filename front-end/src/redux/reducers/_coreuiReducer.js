const INITIAL_STATE = {
  sidebarShow: "responsive",
  darkMode: false,
  asideShow: false,
};

export default function _coreuiReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case "setSidebarShow":
      return {
        ...state,
        sidebarShow: action.sidebarShow,
      };

    case "setDarkMode":
      return {
        ...state,
        darkMode: !state.darkMode,
      };

    case "setAsideShow":
      return {
        ...state,
        asideShow: !state.asideShow,
      };

    default:
      return state;
  }
}
