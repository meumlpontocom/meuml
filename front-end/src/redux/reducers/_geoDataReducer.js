const INITIAL_STATE = {
  statesOfBrazilRepositoryUrl: process.env.REACT_APP_STATES_JSON,
  availableStates: [],
  selectedStates: [],
  availableCities: [],
  selectedCities: [],
  cityStateCoherence: false,
};

export default function _discountReducer(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  switch (action.type) {
    case "SET_CITY_AND_STATE_COHERENCE":
      return {
        ...state,
        cityStateCoherence: action.coherence
      }

    case "SET_AVAILABLE_STATE_LIST":
      return {
        ...state,
        availableStates: action.states.hasOwnProperty("cidades") ? [action.states] : [...action.states]
      }

    case "SET_SELECTED_STATE_LIST":
      return {
        ...state,
        selectedStates: action.states,
        availableCities: action.states.hasOwnProperty("sigla")
          ? action.states.cidades
          : action.states.reduce((cities, state) => {
            return [...cities, ...state.cidades].map(cityName => ({ label: cityName, value: cityName }))
          }, [])
      }

    case "SET_SELECTED_CITIES":
      return { ...state, selectedCities: action.cities.hasOwnProperty("label") ? [action.cities] : action.cities }

    default:
      return state;
  }
}
