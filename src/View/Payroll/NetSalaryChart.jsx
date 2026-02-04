import React from 'react';
import { Line } from 'react-chartjs-2';
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
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const NetSalaryChart = () => {
    const {net_salary_label, net_salary_value} = usePayroll()
    const data = {
        labels: net_salary_label,
        datasets: [
            {
                label: 'Net Salary',
                data: net_salary_value,
                fill: false,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    boxHeight: 5,   
                }
            },
            title: {
                display: false,
            },
        },

        scales: {
            x: {
                grid: {
                    display: true, 
                    color: '#f9f9f9'
                },
            },
            y: {
                grid: {
                    display: true, 
                    color: "#f9f9f9"
                },
            },
        },
    };

    return (
        <div className='w-full h-[300px]'>
             <Line data={data} options={options} />
        </div>
    );

};

export default NetSalaryChart;
