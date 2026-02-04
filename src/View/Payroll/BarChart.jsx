import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,

} from 'chart.js';
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices';

// Tooba
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

const BarChart = () => {
    const { gross_label, gross_value } = usePayroll()

    const labels = Array.isArray(gross_label) ? gross_label : []
    const chartData = Array.isArray(gross_value) ? gross_value : []

    const data = {
        labels,
        datasets: [
            {
                label: 'Annual Gross Salary',
                data: chartData,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                barPercentage: 0.7,
                categoryPercentage: 0.8,
            },
        ],
    }

    const maxDataValue = chartData.length > 0 ? Math.max(...chartData) : 1
    const yAxisMax = maxDataValue > 0 ? maxDataValue * 1.1 : 10

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: true,
                    color: '#f9f9f9'
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                max: yAxisMax,
                grid: {
                    display: true,
                    color: '#f9f9f9'
                },
            },
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    boxHeight: 10,
                }
            },
            title: {
                display: false,
                padding: 10,
            },
        },
    }

    return (
        <div className='w-full h-full min-h-[400px]'>
            <Bar data={data} options={options} />
        </div>
    )
}

export default BarChart;
