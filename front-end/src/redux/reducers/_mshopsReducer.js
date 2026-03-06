import {
    MSHOPS_SAVE_PRODUCT,
    MSHOPS_SAVE_PRODUCT_META,
    MSHOPS_TOGGLE_LOADING,
    MSHOPS_CLEAR_PRODUCT_DATA,
    MSHOPS_SELECT_ALL_ADS,
    MSHOPS_SELECT_ALL_ADS_FROM_PAGE,
    MSHOPS_SELECT_ACCOUNT,
    MSHOPS_SELECT_PRODUCT,
    MSHOPS_TOGGLE_LOADING_STATUS,
    MSHOPS_TOGGLE_LOADING_SHIPPING
} from "../actions/action-types";

const INITIAL_STATE = {
    selectedAccounts: [],
    products: {},
    loading: false,
    pagesSelected: [],
    unselectedProductsException: [],
    allProductsSelected: false,
    mshopsFilter: null,
    loadingStatus: false,
    loadingShipping: false,
    meta: {
        first_page: 1,
        last_page: 1,
        limit: 50,
        next_page: 1,
        offset: 0,
        page: 1,
        pages: 1,
        previous_page: 0,
        total: 0,
    }
};

export default function _mshopsReducer(state = INITIAL_STATE, action) {
    switch (action.type) {

        case MSHOPS_SELECT_ALL_ADS:
            return {
                ...state,
                pagesSelected: [],
                allProductsSelected: !state.allProductsSelected,
            };

        case MSHOPS_CLEAR_PRODUCT_DATA:
            return {
            ...state,
            products: {},
            };

        case MSHOPS_SELECT_ALL_ADS_FROM_PAGE:
            const { products } = state;
            const ads = {};
        
            const currentPageIsSelected = state.pagesSelected.find(
                (page) => page === state.meta.page
            );
        
            for (const id in products) {
                ads[id] = {
                ...products[id],
                selected: !currentPageIsSelected ? true : false,
                };
            }
        
            return {
                ...state,
                products: { ...ads },
                pagesSelected: !currentPageIsSelected
                ? [...state.pagesSelected, state.meta.page]
                : [...state.pagesSelected.filter((page) => page !== state.meta.page)],
            };

        case MSHOPS_SAVE_PRODUCT:
            let productsToSave = {};
            action.payload.forEach((prod) => {
                productsToSave[prod.external_id] = { ...prod, selected: false };
            });
            return {
            ...state,
            products: productsToSave,
            };

        case MSHOPS_TOGGLE_LOADING:
            return {
            ...state,
            loading: !state.loading,
            };

        case MSHOPS_SAVE_PRODUCT_META:
            return {
            ...state,
            meta: action.payload,
            };
        
        case MSHOPS_SELECT_ACCOUNT:
            return {
                ...state,
                selectedAccounts: action.payload,
            };
        
        case MSHOPS_SELECT_PRODUCT:
            if (!action.payload.checked && state.allProductsSelected) {
                return {
                ...state,
                unselectedProductsException: [
                    ...state.unselectedProductsException,
                    action.payload.id,
                ],
                };
            } else if (
                state.unselectedProductsException.find(
                (adId) => adId === action.payload.id
                )
            ) {
                return {
                ...state,
                products: {
                    ...state.products,
                    [action.payload.id]: {
                    ...state.products[action.payload.id],
                    selected: false,
                    },
                },
                unselectedProductsException: [
                    ...state.unselectedProductsException.filter(
                    (adId) => adId !== action.payload.id
                    ),
                ],
                };
            }
        
            return {
                ...state,
                products: {
                ...state.products,
                [action.payload.id]: {
                    ...state.products[action.payload.id],
                    selected: action.payload.checked,
                },
                },
                unselectedProductsException: [
                ...state.unselectedProductsException.filter(
                    (adId) => adId !== action.payload.id
                ),
                ],
            };

        case MSHOPS_TOGGLE_LOADING_STATUS:
            return {
            ...state,
            loadingStatus: !state.loadingStatus,
            };

        case MSHOPS_TOGGLE_LOADING_SHIPPING:
            return {
            ...state,
            loadingShipping: !state.loadingShipping,
            };

        default:
            return state;
    }
}
