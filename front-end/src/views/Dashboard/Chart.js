import React from "react";
import { Col } from "reactstrap";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";

const Chart = () => {
  const { chart } = useSelector((state) => state.dashboard);

  const getOrdersMaxY = () => {
    const orders = 0; // INDEX
    const ordersPerDay = chart.datasets[orders]?.data;
    if (ordersPerDay?.length) {
      let dayWithHighestAmountOfOrders = 0;
      ordersPerDay.forEach((oneDaysOrders) => {
        if (oneDaysOrders > dayWithHighestAmountOfOrders)
          dayWithHighestAmountOfOrders = oneDaysOrders;
      });

      return !dayWithHighestAmountOfOrders > 0
        ? 100
        : dayWithHighestAmountOfOrders;
    }

    return 100;
  };

  const getVisitsMaxY = () => {
    const visits = 1; // INDEX
    const visitsPerDay = chart.datasets[visits]?.data;
    if (visitsPerDay?.length) {
      let mostVisitedDay = 0;
      visitsPerDay.forEach((oneDaysVisits) => {
        if (oneDaysVisits > mostVisitedDay) mostVisitedDay = oneDaysVisits;
      });

      return !mostVisitedDay ? 100 : mostVisitedDay;
    }

    return 100;
  };

  return (
    <>
      <Col sm="12" md="12" lg="12" xs="12" style={{ maxHeight: "450px" }}>
        <Line
          data={chart}
          width={250}
          height={300}
          options={{
            tooltips: {
              cornerRadius: 0,
              caretSize: 0,
              xPadding: 16,
              yPadding: 10,
              backgroundColor: "rgb(228, 231, 234, 0.9)",
              titleFontStyle: "bold",
              titleMarginBottom: 15,
              titleFontColor: "rgb(92, 104, 115)",
              bodyFontColor: "rgb(92, 104, 115)",
              mode: "label"
            },
            responsive: true,
            backgroundColor: "#000",
            maintainAspectRatio: false,
            legend: {
              display: true,
              position: "bottom",
              labels: {
                boxWidth: 15,
                fontColor: "black",
              },
            },
            scales: {
              yAxes: [
                {
                  id: "vendas",
                  position: "left",
                  ticks: {
                    display: true,
                    reverse: false,
                    min: 0,
                    max: getOrdersMaxY(),
                    stepSize: 100,
                    beginAtZero: true,
                  },
                  gridLines: {
                    color: "rgba(77, 189, 116, 1)",
                    drawBorder: true,
                    borderDash: [1, 1],
                  },
                  scaleLabel: {
                    fontStyle: "bold",
                  },
                },
                {
                  id: "visitas",
                  position: "right",
                  ticks: {
                    display: true,
                    reverse: false,
                    min: 0,
                    max: getVisitsMaxY(),
                    stepSize: 50,
                    beginAtZero: true,
                  },
                  gridLines: {
                    color: "rgba(99, 194, 222, 1)",
                    drawBorder: true,
                    borderDash: [1, 1],
                  },
                },
              ],
              xAxes: [
                {
                  gridLines: {
                    display: false,
                    color: "black",
                  },
                  scaleLabel: {
                    display: false,
                    labelString: "ÚLTIMOS 30 (TRINTA) DIAS",
                    fontColor: "red",
                  },
                  zeroLineColor: "rgb(248, 108, 107)",
                  zeroLineWidth: 2,
                },
              ],
            },
          }}
        />
      </Col>
    </>
  );
};

export default Chart;
