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
    Filler
} from 'chart.js';
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices';

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

const GrossSalaryChart = () => {
    const {gross_label, gross_value} = usePayroll()

    // console.log('gross_label', gross_label)
    // console.log('gross_value', gross_value)
   
    const data = {
        labels: gross_label,
        datasets: [
            {
                label: 'Gross Salary',
                data: gross_value,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                tension: 0.4
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
        plugins: {
            filler: {
                propagate: true
            },

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
                padding: 10,
            },
        },
      
    };

    return (
        <div className='w-full h-[300px]'>
             <Line data={data} options={options} />
        </div>
    );

};

export default GrossSalaryChart;
