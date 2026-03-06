import {
  FLEX_SHIPPING_CONFIG_COVERAGEZONE,
  FLEX_SHIPPING_CONFIG,
} from "../actions/action-types";
const INITIAL_STATE = {
  converageZoneConfig: {
    id: "BR-SP-Centro",
    is_mandatory: false,
    label: "Centro",
    polygon: {
      geometry: {
        coordinates: [],
      },
    },
  },
  configuration: {
    address: {},
    adoption: {},
    capacity: {},
    cutoff: {},
    training_time: {},
    zones: [],
  },
};

export default function _flexShippingConfig(state = [], action) {
  if (state.length === 0) {
    return INITIAL_STATE;
  }

  switch (action.type) {
    case FLEX_SHIPPING_CONFIG_COVERAGEZONE:
      return { ...state, converageZoneConfig: { ...action.payload } };

    case FLEX_SHIPPING_CONFIG:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
