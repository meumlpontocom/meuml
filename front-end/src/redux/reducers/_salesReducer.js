import {
  SALES_TOGGLE_LOADING,
  SALES_TOGGLE_IS_CARD_OPEN,
  SALES_SAVE_FILTER_STRING,
  SALES_SAVE_SELECTED_ACCOUNTS,
  SALES_RESET_FILTER_STRING,
  SALES_SAVE_SALES,
  SALES_SAVE_META,
  SALES_SAVE_STATUS_FILTER,
  SALES_SET_SELECTED_SALE,
  SALES_COLLAPSE_ALL_CARDS,
  SALES_SET_SELECT_ALL,
  SALES_CLEAN_SALES_STATE,
  SALES_FETCH_MSHOPS,
} from "../actions/action-types";

const INITIAL_STATE = {
  sales: {},
  meta: {},
  filter: "",
  loading: false,
  isCardOpen: {},
  filterString: "",
  selectedAccounts: [],
  selectedFilterStatus: [],
  selectedSales: {},
  selectAllSales: false,
  filterStatusList: [
    { label: "Aguardando prazo", value: "manufacturing" },
    { label: "Aguardando envio", value: "awaiting_shipment" },
    { label: "Recentes", value: "recent_orders" },
    { label: "Etiqueta pronta", value: "label_ready" },
    { label: "Entregue", value: "delivered" },
    { label: "Finalizadas", value: "finished" },
  ],
  mshops: 0,
};

export default function salesReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SALES_FETCH_MSHOPS:
      return {
        ...state,
        mshops: action.payload ? 1 : 0,
      };

    case SALES_CLEAN_SALES_STATE:
      return INITIAL_STATE;

    case SALES_SET_SELECT_ALL:
      let _state = {
        ...state,
        selectAllSales: action.payload,
        selectedSales: { ...state.sales },
      };
      Object.keys(_state.selectedSales).forEach(key => (_state.selectedSales[key] = action.payload));
      return _state;

    case SALES_SET_SELECTED_SALE:
      return {
        ...state,
        selectedSales: {
          ...state.selectedSales,
          [action.payload.id]: action.payload.checked,
        },
      };

    case SALES_SAVE_STATUS_FILTER:
      const statusList = action.payload;
      return {
        ...state,
        selectedFilterStatus: statusList,
      };

    case SALES_SAVE_SALES:
      let sales = {};
      let isCardOpen = {};
      action.payload.forEach(sale => {
        sales[sale.sale.id] = sale;
        isCardOpen[sale.sale.id] = false;
      });
      return {
        ...state,
        sales,
        isCardOpen,
      };

    case SALES_SAVE_META:
      return {
        ...state,
        meta: action.payload,
      };

    case SALES_TOGGLE_LOADING:
      return {
        ...state,
        loading: !state.loading,
      };

    case SALES_TOGGLE_IS_CARD_OPEN:
      return {
        ...state,
        isCardOpen: {
          ...state.isCardOpen,
          [action.payload]: !state.isCardOpen[action.payload],
        },
      };

    case SALES_COLLAPSE_ALL_CARDS:
      let list = {};
      Object.keys(state.sales).forEach(key => {
        list[key] = action.payload;
      });

      return { ...state, isCardOpen: list };

    case SALES_SAVE_FILTER_STRING:
      return {
        ...state,
        filterString: action.payload,
      };

    case SALES_RESET_FILTER_STRING:
      return {
        ...state,
        filterString: "",
      };

    case SALES_SAVE_SELECTED_ACCOUNTS:
      return {
        ...state,
        selectedAccounts: action.payload,
      };

    default:
      return state;
  }
}
