import {
  SET_IS_LOADING,
  SET_PAYER_DATA,
  SET_IS_LOADING_PAYER_INFO,
  SET_CURRENT_USER_FORM_TAB,
  SET_USER_NAME,
  SET_USER_EMAIL,
  SET_USER_CPF_CNPJ,
  SET_USER_ZIP_CODE,
  SET_USER_ADDRESS_STREET,
  SET_USER_ADDRESS_NUMBER,
  SET_USER_ADDRESS_DISTRICT,
  SET_USER_ADDRESS_COMPLEMENT,
  SET_USER_ADDRESS_CITY,
  SET_USER_ADDRESS_CITY_CODE,
  SET_USER_ADDRESS_PROVINCE,
  SET_SHOW_DISCLAIMER_MODAL,
  SET_SHOW_USER_DATA_FORM_MODAL,
  SET_PAYMENT_CHECKOUT,
  SET_SHOW_PAYMENT_REVIEW_MODAL,
  SET_SHOW_PIX_MODAL,
  SET_USER_DATA_HISTORY, SET_USER_INSCRICAO_MUNICIPAL,
} from "./actions/types";

export const initialState = {
  isLoading: false,
  isLoadingPayerInfo: false,
  showDisclaimerModal: true,
  showUserDataFormModal: false,
  showPaymentReviewModal: false,
  showPixModal: false,
  payerFormSelectedTab: "cpf",
  payerData: {
    cep: "",
  },
  payerDataHistory: [],
  payments: {
    internal_order_id: null,
    total: null,
  },
};

const paymentReducer = (state, action) => {
  switch (action.type) {
    case SET_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case SET_IS_LOADING_PAYER_INFO:
      return {
        ...state,
        isLoadingPayerInfo: action.payload,
      };

    case SET_SHOW_DISCLAIMER_MODAL:
      return {
        ...state,
        showDisclaimerModal: action.payload,
      };

    case SET_SHOW_USER_DATA_FORM_MODAL:
      if (state.showUserDataFormModalTimestamp - Date.now() === -1) {
        return state;
      }
      return {
        ...state,
        showUserDataFormModal: action.payload,
        showUserDataFormModalTimestamp: Date.now(),
      };

    case SET_CURRENT_USER_FORM_TAB:
      return {
        ...state,
        payerFormSelectedTab: action.payload,
      };

    case SET_SHOW_PAYMENT_REVIEW_MODAL:
      return {
        ...state,
        showPaymentReviewModal: action.payload,
      }

    case SET_SHOW_PIX_MODAL:
      return {
        ...state,
        showPixModal: action.payload
      }

    case SET_PAYER_DATA:
      return {
        ...state,
        payerData: action.payload,
      };

    case SET_USER_DATA_HISTORY:
      return {
        ...state,
        payerDataHistory: action.payload,
      };

    case SET_USER_NAME:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          razao_social: action.payload,
        },
      };

    case SET_USER_EMAIL:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          email: action.payload,
        },
      };

    case SET_USER_CPF_CNPJ:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          cpf_cnpj: action.payload,
        },
      };

    case SET_USER_INSCRICAO_MUNICIPAL:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          inscricao_municipal: action.payload,
        },
      };

    case SET_USER_ZIP_CODE:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          cep: action.payload || ""
        },
      };

    case SET_USER_ADDRESS_STREET:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          logradouro: action.payload,
        },
      };

    case SET_USER_ADDRESS_NUMBER:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          numero: action.payload,
        },
      };

    case SET_USER_ADDRESS_DISTRICT:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          bairro: action.payload,
        },
      };

    case SET_USER_ADDRESS_COMPLEMENT:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          complemento: action.payload,
        },
      };

    case SET_USER_ADDRESS_CITY:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          descricao_cidade: action.payload,
        },
      };
    
    case SET_USER_ADDRESS_CITY_CODE:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          codigo_cidade: action.payload,
        },
      };
    
    case SET_USER_ADDRESS_PROVINCE:
      return {
        ...state,
        payerData: {
          ...state.payerData,
          estado: action.payload,
        },
      }

    case SET_PAYMENT_CHECKOUT:
      return {
        ...state,
        payments: {
          ...state.payments,
          total: action.payload.total,
          internal_order_id: action.payload.checkoutId,
          totalFormatted: action.payload.totalFormatted,
          orderType: action.payload.orderType,
        },
      }

    default:
      return state;
  }
};

export default paymentReducer;
