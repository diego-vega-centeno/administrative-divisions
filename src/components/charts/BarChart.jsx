import { Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
// import { dataIndex } from '../../utils/addData.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BarChart({ chartData, labels, config }) {

  const [data, setData] = useState({ labels: [], datasets: [] });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
        position: 'top',
      },
      tooltip: {
        titleColor: '#ffffff',
        bodyColor: 'white',
        backgroundColor: '#222222',
      },
      // title: {
      //   display: true,
      //   text: 'Chart.js Bar Chart',
      // },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255,255,255,0.2)',
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(255,255,255,0.2)',
        },
      },
    }
  };


  useEffect(() => {
    const newData = {
      labels,
      datasets: [
        {
          label: config.title,
          data: chartData,
          backgroundColor: config.color,
          borderColor: 'rgb(33 37 41)',
          borderWidth: 2,
        }
      ],
    };

    setData(newData);
  }, [chartData])


  return (
    <Bar options={options} data={data} />
  )
}