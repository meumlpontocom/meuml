import {
  SAVE_USER_ACCOUNTS,
  SAVE_SELECTED_ACCOUNTS,
  ACCOUNTS_SET_IS_LOADING,
} from "../actions/action-types";

const INITIAL_STATE = {
  accounts: [],
  selectedAccounts: [],
  isLoading: false,
};

export default function _accountsReducer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  switch (action.type) {
    case SAVE_USER_ACCOUNTS:
      const { payload } = action;
      let accounts = {};
      for (const account in payload) {
        accounts[payload[account].id] = payload[account];
      }
      return {
        ...state,
        accounts,
      };
    case SAVE_SELECTED_ACCOUNTS:
      return {
        ...state,
        selectedAccounts: action.payload,
      };

    case ACCOUNTS_SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}
