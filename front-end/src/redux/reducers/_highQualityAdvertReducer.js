import {
  HIGH_QUALITY_TOGGLE_LOADING,
  HIGH_QUALITY_SAVE_ADVERT_ID,
  HIGH_QUALITY_SAVE_ACCOUNT_ID,
  HIGH_QUALITY_SAVE_ADVERT_DATA,
  HIGH_QUALITY_SAVE_NEW_TITLE,
  HIGH_QUALITY_SAVE_NEW_DESCRIPTION,
  HIGH_QUALITY_SAVE_NEW_GTIN,
  HIGH_QUALITY_REMOVE_ADVERT_IMAGE,
  HIGH_QUALITY_SAVE_NEW_ADVERT_IMAGE,
  HIGH_QUALITY_SAVE_ERRORS,
} from "../actions/action-types";

const INITIAL_STATE = {
  isLoading: false,
  advertId: null,
  accountId: null,
  advertData: {},
  errors: {},
};

export default function _highQualityAdvertReducer(
  state = INITIAL_STATE,
  action
) {
  switch (action.type) {
    case HIGH_QUALITY_TOGGLE_LOADING:
      return { ...state, isLoading: !state.isLoading };

    case HIGH_QUALITY_SAVE_ADVERT_ID:
      return {
        ...state,
        advertId: action.payload,
      };

    case HIGH_QUALITY_SAVE_ACCOUNT_ID:
      return {
        ...state,
        accountId: action.payload,
      };

    case HIGH_QUALITY_SAVE_ADVERT_DATA:
      return {
        ...state,
        advertData: action.payload,
      };

    case HIGH_QUALITY_SAVE_NEW_TITLE:
      return {
        ...state,
        advertData: {
          ...state.advertData,
          title: action.payload,
        },
      };

    case HIGH_QUALITY_SAVE_NEW_DESCRIPTION:
      return {
        ...state,
        advertData: {
          ...state.advertData,
          description: { plain_text: action.payload },
        },
      };

    case HIGH_QUALITY_SAVE_NEW_GTIN:
      let upgrade = {
        advertData: {
          ...state.advertData,
          attributes: Object.values(state.advertData.attributes).map(
            (attribute) => {
              if (attribute.id === "GTIN")
                return { ...attribute, value_name: action.payload };
              return attribute;
            }
          ),
        },
      };
      if (
        !Object.values(upgrade.advertData.attributes).filter(
          (attribute) => attribute.id === "GTIN"
        )?.length
      ) {
        const attributes = [...upgrade.advertData.attributes];
        const gtin = [
          {
            id: "GTIN",
            value_name: action.payload,
            name: "Código universal de produto",
            attribute_group_name: "Outros",
            attribute_group_id: "OTHERS",
          },
        ];
        const gtinIncluded = {
          ...upgrade,
          attributes: [...gtin, ...attributes],
        };
        return {
          ...state,
          ...gtinIncluded,
        };
      }

      return {
        ...state,
        ...upgrade,
      };

    case HIGH_QUALITY_REMOVE_ADVERT_IMAGE:
      return {
        ...state,
        advertData: {
          ...state.advertData,
          pictures: state.advertData.pictures.filter(
            (picture, index) => index !== action.payload
          ),
        },
      };

    case HIGH_QUALITY_SAVE_NEW_ADVERT_IMAGE:
      return {
        ...state,
        advertData: {
          ...state.advertData,
          pictures: [
            ...state.advertData.pictures,
            {
              secure_url: `https://mlb-s2-p.mlstatic.com/${action.payload}`,
              id: action.payload,
            },
          ],
        },
      };

    case HIGH_QUALITY_SAVE_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };

    default:
      return state;
  }
}
