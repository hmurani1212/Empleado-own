import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PayrollMetricChart = ({
  labels = [],
  values = [],
  title = "",
  borderColor = "#10b981",
  backgroundColor = "rgba(16,185,129,0.16)",
}) => {
  const chartLabels = Array.isArray(labels) ? labels : [];
  const chartValues = Array.isArray(values) ? values : [];

  const data = {
    labels: chartLabels,
    datasets: [
      {
        label: title,
        data: chartValues,
        fill: true,
        borderColor,
        backgroundColor,
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: borderColor,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          boxHeight: 8,
          color: "#334155",
          font: { size: 12, weight: 600 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${Number(context.parsed.y || 0).toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(148, 163, 184, 0.15)",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          maxRotation: 30,
          minRotation: 30,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.15)",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          callback: (value) => Number(value).toLocaleString(),
        },
      },
    },
  };

  return (
    <div className="w-full h-[280px]">
      <Line data={data} options={options} />
    </div>
  );
};

export default PayrollMetricChart;
