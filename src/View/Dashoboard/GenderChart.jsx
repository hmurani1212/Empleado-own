import React from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import useDashboard from '../../ViewModel/DashboardViewModel/DashboardServices';
ChartJS.register(ArcElement, Tooltip, Legend);

const GenderChart = () => {
    const { dashboardData } = useDashboard()
    const numericalValues = dashboardData?.SEXWISE_EMPLOYEES?.slice(1).map(item => item[1]);

    const data = {
        labels: ['Female', 'Male'],
        datasets: [
            {
            label: 'Employement Ratio',
            data: numericalValues,
            backgroundColor: [
                'rgb(255, 127, 191)',
                'rgb(59, 138, 217)',
            ],
            borderColor: [
                'rgba(255, 127, 191)',
                'rgba(59, 138, 217)'
            ],
            borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
                legend: {
                    align: 'start',
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                        boxHeight: 5,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: false,
                    padding: 10
                },
                maintainAspectRatio: false,
            },
    };
    return (
        <div className='h-[220px] flex justify-center'>
            <Pie data={data} options={options} width={100} height={15} />
        </div>
    )
}

export default GenderChart