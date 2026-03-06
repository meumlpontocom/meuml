import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { useSelector } from "react-redux";

const QualityChart = () => {
  const { level, quality } = useSelector((store) => store.qualityDetails);
  const color = useMemo(() => {
    if (quality < 60) return "red";
    else if (quality < 80) return "yellow";
    else if (quality < 100) return "greenyellow";
    else if (quality >= 100) return "green";
    else return "";
  }, [quality]);
  let chartOptions = {
    responsive: true,
    legend: {
      display: false,
    },
    cutoutPercentage: 60,
    tooltips: {
      enabled: false,
    },
  };

  let data = {
    datasets: [
      {
        data: [quality, `${100 - quality}`],
        backgroundColor: [color, "#ebedef"],
      },
    ],
    labels: ["qualidade", ""],
  };
  return (
    <div className="d-flex justify-content-end mb-5 mb-md-0 mr-3 mr-md-0">
      <div className="mr-4 d-flex flex-column align-items-end justify-content-center">
        <p className="text-muted h4">{level}</p>
        <p className="text-secondary text-right mb-0">
          Realize as ações recomendadas e potencialize o sucesso do anúncio
        </p>
      </div>
      <div className="chart-content">
        <p className="chart-percentage text-muted font-weight-bolder">
          {quality} %
        </p>
        <Doughnut data={data} width={100} height={100} options={chartOptions} />
      </div>
    </div>
  );
};

export default QualityChart;
