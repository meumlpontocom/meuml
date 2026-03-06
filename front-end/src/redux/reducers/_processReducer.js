import {
  SAVE_PROCESS_LIST,
  CLEAR_PROCESS_LIST,
  SAVE_PROCESS_DETAILS,
} from "../actions/action-types";

const INITIAL_STATE = {
  processList: [],
  processDetails: [],
};

export default function _processReducer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  switch (action.type) {
    case SAVE_PROCESS_LIST:
      const updatedData = { ...state, processList: action.payload };
      return updatedData;

    case CLEAR_PROCESS_LIST:
      return INITIAL_STATE;

    case SAVE_PROCESS_DETAILS:
      return {
        ...state,
        processDetails: {
          ...state.processDetails,
          [action.payload.processId]: action.payload.details,
        },
      };

    default:
      return state;
  }
}
