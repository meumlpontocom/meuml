import produce                                                from "immer";
import { PAYMENT_SAVE_TOTAL_AND_ID,PAYMENT_SAVE_CLIENT_DATA } from "../actions/action-types";

const INITIAL_STATE = {
  checkoutId: "",
  total: 0,
  clientData: [],
  orderType: "",
};

export default function _payment(state = INITIAL_STATE, action) {
  return produce(state, (draft) => {
    switch (action.type) {
      case PAYMENT_SAVE_TOTAL_AND_ID: {
        const {
          data: { checkoutId, total, orderType },
        } = action.payload;

        draft.checkoutId = checkoutId;
        draft.total = total;
        draft.orderType = orderType;

        break;
      }

      case PAYMENT_SAVE_CLIENT_DATA:
        draft.clientData = action.payload;
        break;

      default:
        return state;
    }
  });
}
