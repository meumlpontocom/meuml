/* eslint-disable import/no-anonymous-default-export */
import { setPeriodDate } from "../../redux/actions/_dashboardActions";

export const formatDate = date => date.toISOString().split("T", 1)[0];

export default {
  today: ({ dispatch }) => {
    dispatch(
      setPeriodDate({
        fromDate: formatDate(new Date(new Date().setDate(new Date().getDate()))),
      }),
    );
  },

  week: ({ dispatch }) => {
    dispatch(
      setPeriodDate({
        fromDate: formatDate(new Date(new Date().setDate(new Date().getDate() - 7))),
      }),
    );
  },

  quarter: ({ dispatch }) => {
    dispatch(
      setPeriodDate({
        fromDate: formatDate(new Date(new Date().setDate(new Date().getDate() - 15))),
      }),
    );
  },

  month: ({ dispatch }) => {
    const actualMonth = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    dispatch(
      setPeriodDate({
        fromDate: `${year}-${actualMonth < 10 ? `0${actualMonth}` : actualMonth}-01`,
        toDate: `${year}-${actualMonth < 10 ? `0${actualMonth}` : actualMonth}-${new Date().getDate()}`,
      }),
    );
  },

  fetchCustomPeriodData: ({ dispatch, fromDate, toDate }) => {
    dispatch(setPeriodDate({ fromDate, toDate }));
  },
};
