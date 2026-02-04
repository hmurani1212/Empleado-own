import React from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const options = {
    responsive: true,
    scales: {
        x: {
            grid: {
                display: true,
                color: '#f9f9f9'
            },
            ticks: {
                autoSkip: true,
                maxRotation: 45,
                minRotation: 45,
                font: {
                    size: 10
                }
            }
        },
        y: {
            grid: {
                display: true,
                color: "#f9f9f9"
            },
            beginAtZero: true,
            ticks: {
                stepSize: 2
            },
            title: {
                display: true,
                text: 'Hours',
                font: {
                    size: 12
                }
            }
        },
    },
    plugins: {
        legend: {
            align: 'end',
            position: 'top',
            labels: {
                usePointStyle: true,
                boxWidth: 10,
                boxHeight: 5,
            }
        },
        title: {
            display: false,
            padding: 10
        },
        maintainAspectRatio: false,
    },
};

const MonthlyWorkingHoursChart = ({ attendanceData, monthLabel }) => {
    // Prefer API-provided chartData (2D array), fallback to sample if missing
    const chartMatrix = Array.isArray(attendanceData?.chartData) && attendanceData.chartData.length > 1
        ? attendanceData.chartData
        : [
            ["Date", "Working Hours"],
            ["02/Sep", 0],
            ["03/Sep", 0],
            ["04/Sep", 0],
            ["05/Sep", 0],
            ["06/Sep", 0],
            ["07/Sep", 0],
        ];

    const labels = [];
    const workingHoursData = [];

    // Process chartMatrix: skip header row; use first col as label, second as hours
    for (let i = 1; i < chartMatrix.length; i++) {
        const row = chartMatrix[i] || [];
        const label = String(row[0] ?? '');
        const hours = Number(row[1] ?? 0);
        labels.push(label);
        workingHoursData.push(hours);
    }

    const data = {
        labels,
        datasets: [
            {
                label: '  Working Hours',
                data: workingHoursData,
                borderColor: 'rgb(61, 165, 244)',
                backgroundColor: 'rgb(61, 165, 244)',
                borderWidth: 2,
                tension: 0.4,
            },
        ],
    }

    return (
        <div className='w-full h-full'>
            <Line
                data={data}
                options={{
                    ...options,
                    maintainAspectRatio: false
                }}
            />
        </div>
    )
}

export default MonthlyWorkingHoursChart

