import produce from "immer";

import {
  CHECK_ADVERT,
  CHECK_ALL_ADS,
  CHECK_ALL_ADS_FROM_PAGE,
  SAVE_ADVERTS,
  SET_SELECTED_CATEGORY,
  UNCHECK_ALL_ADS,
} from "../actions/action-types";

const INITIAL_STATE = {
  advertsArray: {},
  allChecked: false,
  pagesAllChecked: false,
};

export default function advertsSelectionReducer(state = INITIAL_STATE, action) {
  return produce(state, draft => {
    switch (action.type) {
      case CHECK_ADVERT: {
        const { id, checked, status, title, price, advertData, shopeeRequiredAttributes } = action.payload;
        draft.advertsArray[id] = {
          ...draft.advertsArray[id],
          id,
          checked,
          status,
          title,
          price,
          advertData,
          shopeeRequiredAttributes,
        };
        break;
      }

      case SAVE_ADVERTS: {
        Object.values(action.payload).map(item => {
          if (draft.advertsArray[item.external_id]) {
            return (draft.advertsArray[item.external_id] = {
              id: item.external_id,
              checked: draft.advertsArray[item.external_id].checked,
              account_name: item.external_name,
              account_id: item.account_id,
              status: item.status,
              price: item.price,
              title: item.title,
            });
          }
          return (draft.advertsArray[item.external_id] = {
            id: item.external_id,
            checked: draft.allChecked,
            account_name: item.external_name,
            account_id: item.account_id,
            status: item.status,
            price: item.price,
            title: item.title,
          });
        });
        break;
      }

      case CHECK_ALL_ADS: {
        const { adverts } = action.payload;

        Object.values(adverts).map(item => {
          return (draft.advertsArray[item.external_id] = {
            id: item.external_id,
            checked: true,
            account_id: item.account_id,
            account_name: item.external_name,
            status: item.status,
            price: item.price,
            title: item.title,
          });
        });

        draft.allChecked = true;
        draft.pagesAllChecked = false;

        // draft.advertsArray = {};
        // draft.allChecked = true;
        // draft.pagesAllChecked = false;
        break;
      }

      case UNCHECK_ALL_ADS: {
        return INITIAL_STATE;
      }

      case CHECK_ALL_ADS_FROM_PAGE: {
        const { adverts } = action.payload;

        Object.values(adverts).map(item => {
          return (draft.advertsArray[item.external_id] = {
            id: item.external_id,
            checked: true,
            account_id: item.account_id,
            account_name: item.external_name,
            status: item.status,
            price: item.price,
            title: item.title,
            advertData: item,
          });
        });

        draft.allChecked = false;
        draft.pagesAllChecked = true;
        break;
      }

      case SET_SELECTED_CATEGORY: {
        const { external_id, selectedCategoryId } = action.payload;

        if (draft.advertsArray[external_id]) {
          draft.advertsArray[external_id] = {
            ...draft.advertsArray[external_id],
            categoryId: selectedCategoryId,
          };
        }

        break;
      }

      default:
        return state;
    }
  });
}
