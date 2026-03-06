import {
  SAVE_QUESTIONS,
  CLEAR_ANSWERED_QUESTIONS,
  SAVE_ANSWERED_QUESTION_MSG
} from "../actions/action-types";

const INITIAL_STATE = {
  data: {},
  message: "no-data",
  meta: {}
};

export default function _questionsReducer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  switch (action.type) {
    case SAVE_QUESTIONS:
      return {
        ...action.payload
      };

    case CLEAR_ANSWERED_QUESTIONS:
      const { index, adIndex, seller_id } = action.payload;
      let stateCopy = { ...state };
      stateCopy.data[seller_id].advertisings[adIndex].questions.splice(
        index,
        1
      );
      if (
        stateCopy.data[seller_id]?.advertisings[adIndex]?.questions.length === 0
      ) {
        delete stateCopy.data[seller_id]?.advertisings[adIndex];
        return stateCopy.data[seller_id]?.advertisings.length > 0
          ? { ...stateCopy }
          : { ...stateCopy, message: "no-data" };
      }
      return {
        ...stateCopy
      };

    case SAVE_ANSWERED_QUESTION_MSG:
      return {
        ...state,
        meta: {
          status: action.payload.status,
          type: action.payload.type
        }
      };

    default:
      return state;
  }
}
