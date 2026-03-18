import { Bar } from "react-chartjs-2";
import { useState, useEffect } from "react";
// import { dataIndex } from '../../utils/addData.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { faChessKing } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface BarChartProps {
  chartData: Record<string, any>;
  labels: string[];
  config: {
    color: string;
    title: string;
    type: string;
  };
}

interface DataType {
  datasets: {
    label: string;
    data: Record<string, any>;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
  labels: string[];
}

export default function BarChart({ chartData, labels, config }: BarChartProps) {
  console.log([chartData, labels, config]);
  const [data, setData] = useState<DataType>({
    datasets: [],
    labels: [] as string[],
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
        position: "top",
      },
      tooltip: {
        titleColor: "#ffffff",
        bodyColor: "white",
        backgroundColor: "#222222",
      },
      // title: {
      //   display: true,
      //   text: 'Chart.js Bar Chart',
      // },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255,255,255,0.2)",
        },
      },
      y: {
        ticks: {
          color: "white",
        },
        grid: {
          color: "rgba(255,255,255,0.2)",
        },
      },
    },
  };

  useEffect(() => {
    const datasets = [
      {
        label: config.title,
        data: chartData,
        backgroundColor: config.color,
        borderColor: "rgb(33 37 41)",
        borderWidth: 2,
      },
    ];
    if (config.type === "compare") {
      setData({
        datasets: datasets,
        labels: labels,
      });
    } else {
      setData({
        datasets: datasets,
        labels: labels,
      });
    }
  }, [chartData]);

  return <Bar options={options as Record<string, any>} data={data} />;
}
