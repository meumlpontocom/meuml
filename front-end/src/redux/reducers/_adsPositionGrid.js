import {
  SAVE_ADS_POSITION_GRID,
  SAVE_ADS_POSITION_GRID_PAGINATION,
  SAVE_ADS_POSITION_GRID_URL,
  SAVE_SELECTED_ACCOUNTS,
  SAVE_FILTER_STRING
} from "../actions/action-types";
const INITIAL_STATE = {
  array: [],
  url: "/advertisings/positions_grid?sort_name=position&sort_order=asc",
  pagination: {
    first_page: 0,
    last_page: 0,
    limit: 50,
    next_page: 0,
    offset: 50,
    page: 0,
    pages: 1,
    previous_page: 0,
    total: 0
  },
  selectedAccounts: [],
  filterString: ""
};

export default function _adsPositionGrid(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  switch (action.type) {
    case SAVE_ADS_POSITION_GRID:
      return { ...state, array: action.payload };

    case SAVE_ADS_POSITION_GRID_PAGINATION:
      return { ...state, pagination: action.payload };

    case SAVE_ADS_POSITION_GRID_URL:
      return { ...state, url: action.payload };

    case SAVE_SELECTED_ACCOUNTS:
      return { ...state, selectedAccounts: action.payload };

    case SAVE_FILTER_STRING:
      return { ...state, filterString: action.payload };

    default:
      return state;
  }
}
