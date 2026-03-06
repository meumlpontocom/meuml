import {
  DASHBOARD_TOGGLE_LOADING,
  DASHBOARD_DEFINE_PERIOD,
  DASHBOARD_SAVE_DATA,
  DASHBOARD_SAVE_META,
  DASHBOARD_SET_PERIOD,
} from "../actions/action-types";

const todaysDate = new Date().toISOString().split("T", 1)[0];
const lastMonth = new Date();

const INITIAL_STATE = {
  daily: [{ date: todaysDate, orders: 0, visits: 0 }],
  percent_variance: {
    active_advertisings: "0%",
    new_orders: "N/A",
    new_questions: "N/A",
    total_orders: "N/A",
    total_visits: "N/A",
  },
  summary: {
    active_advertisings: 0,
    new_orders: 0,
    new_questions: 0,
    total_orders: 0,
    total_visits: 0,
  },
  chart: {
    labels: [],
    datasets: [],
  },
  isLoading: false,
  meta: {},
  fromDate: new Date(lastMonth.setDate(lastMonth.getDate() - 30)).toISOString().split("T", 1)[0],
  toDate: todaysDate,
};

export default function _dashboardReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case DASHBOARD_SET_PERIOD:
      return {
        ...state,
        fromDate: action.payload.fromDate || state.fromDate,
        toDate: action.payload.toDate || state.toDate,
      };

    case DASHBOARD_TOGGLE_LOADING:
      return {
        ...state,
        isLoading: !state.isLoading,
      };

    case DASHBOARD_DEFINE_PERIOD:
      return {
        ...state,
        period: action.payload,
      };

    case DASHBOARD_SAVE_DATA:
      const { daily, percent_variance, summary } = action.payload;
      if (daily && daily?.length) {
        const getLabels = (dateList) => {
          return dateList.map((day) => {
            const dateToString = day.date.toString();
            const prototype = new Date(dateToString);
            const prototypeToLocaleDateString = prototype.toLocaleDateString(
              "pt-BR"
            );
            return prototypeToLocaleDateString;
          });
        };

        const getVisits = (daily) => {
          return {
            label: "Quantidade de visitas",
            yAxisId: "visitas",
            backgroundColor: "rgba(99, 194, 222, 0.2)",
            borderColor: "rgba(99, 194, 222, 0.5)",
            data: daily.map(({ visits }) => visits),
          };
        };

        const getOrders = (daily) => {
          return {
            label: "Quantidade de vendas",
            yAxisId: "vendas",
            backgroundColor: "rgba(77, 189, 116, 0.2)",
            borderColor: "rgba(77, 189, 116, 0.5)",
            data: daily.map(({ orders }) => orders),
          };
        };

        return {
          ...state,
          summary,
          percent_variance,
          chart: {
            labels: getLabels(daily),
            datasets: [getVisits(daily), getOrders(daily)],
          },
        };
      }
      return {
        ...state,
        summary,
        percent_variance,
      };

    case DASHBOARD_SAVE_META:
      return {
        ...state,
        meta: action.payload,
      };

    default:
      return state;
  }
}
