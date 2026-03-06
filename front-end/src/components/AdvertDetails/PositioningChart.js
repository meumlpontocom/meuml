import React from "react";
import { Col } from "reactstrap";
import { Line } from "react-chartjs-2";

export default function PositioningChart({ advertDetails }) {
  let chartOptions = {
    tooltips: {
      cornerRadius: 0,
      caretSize: 0,
      xPadding: 16,
      yPadding: 10,
      backgroundColor: "rgba(0, 150, 100, 0.9)",
      titleFontStyle: "normal",
      titleMarginBottom: 15,
    },
    responsive: true,
    backgroundColor: "#000",
    maintainAspectRatio: false,
    legend: {
      display: true,
      position: "top",
      labels: {
        boxWidth: 80,
        fontColor: "black",
      },
    },
    scales: {
      yAxes: [
        {
          ticks: {
            display: true,
            reverse: true,
            min: 1,
            max: 1000,
            stepSize: 100,
          },
          gridLines: {
            color: "gray",
            drawBorder: true,
            borderDash: [1, 1],
          },
          scaleLabel: {
            display: true,
            labelString: "POSICIONAMENTO",
            fontColor: "#9D9D9D",
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
            display: true,
            labelString: "ÚLTIMOS 30 (TRINTA) DIAS",
            fontColor: "red",
          },
          zeroLineColor: "#054785",
          zeroLineWidth: 2,
        },
      ],
    },
  };
  const chartBottomSubtitle = () => {
    return advertDetails.positions.map((positionObj) =>
      convertTimeString(positionObj.position_at)
    );
  };
  const convertTimeString = (timeString) => {
    const dateConfig = {
      month: "numeric",
      day: "numeric",
    };
    return new Date(timeString).toLocaleDateString("pt-BR", dateConfig);
  };
  const getChartData = () => {
    let chartJsConfig = {
      labels: chartBottomSubtitle(),
      datasets: chartDataSets(),
    };

    return chartJsConfig;
  };
  const chartDataSets = () => {
    const data = advertDetails.positions.map(
      (positionObj) => positionObj.position
    );
    const viableData = [...data.filter((y) => y !== null)];
    let defaultSettings = {
      label: "POSIÇÃO DO ANÚNCIO",
      data,
      backgroundColor: ["rgba(54, 162, 235, 0.7)"],
      borderColor: ["rgba(54, 162, 235, 1)"],
      borderWidth: 2,
      ticks: {
        reverse: true,
      },
    };
    const setDumbChartConfig = () => {
      const dumbChartBackgroundColor = "rgba(255, 99, 132, 0)";
      const dumbChartBorderColor = "rgba(255, 99, 132, 1.0)";
      const dumbChartTooltipColor = "rgba(132, 132, 132, 1)";
      chartOptions.scales.yAxes[0].ticks.display = false;
      chartOptions.tooltips.backgroundColor = dumbChartTooltipColor;
      defaultSettings.borderColor = dumbChartBorderColor;
      defaultSettings.backgroundColor = dumbChartBackgroundColor;
      return;
    };
    Math.min(...viableData) === Math.max(...viableData)
      ? setDumbChartConfig()
      : (chartOptions.scales.yAxes[0].ticks.min = Math.min(...viableData));

    return [
      /* Each object in the array represents one label-yAxis in the Chart */
      { ...defaultSettings },
    ];
  };
  return (
    <>
      <h4 style={{ color: "#9D9D9D" }}>
        <i className="cil-caret-right mr-1" />
        <span>POSICIONAMENTO</span>
      </h4>
      <Col sm="12" md="12" lg="12" xs="12">
        <Line
          data={getChartData()}
          width={250}
          height={300}
          options={chartOptions}
        />
      </Col>
    </>
  );
}
