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
import useDashboard from '../../ViewModel/DashboardViewModel/DashboardServices';

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
                    display: false, // Set to true to show vertical grid lines on the x-axis
                },
            },
            y: {
                grid: {
                    display: true, 
                    color: "#DBDEE4"
                },
            },
        },

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

const JoinedChart = () => {
    const { dashboardData } = useDashboard()

    // console.log('EMPLOYEES_GROWTH', dashboardData.EMPLOYEES_GROWTH)
     const labels = dashboardData?.ALL_EMPLOYEES_GRAPH?.slice(1).map(item => item[0]);
    const data = {
        labels, 
        datasets: [
            {
                label: '  Joined',
                data :dashboardData?.ALL_EMPLOYEES_GRAPH?.slice(1).map(item => item[1]),
                borderColor: 'rgb(10, 207, 151)',
                backgroundColor: 'rgb(10, 207, 151)',
                borderWidth: 1, 
                tension:0.4
                
            },
            {
                label: '  Left',
                data: dashboardData?.ALL_EMPLOYEES_GRAPH?.slice(1).map(item => item[2]),
                borderColor: 'rgb(233, 49, 18)',
                backgroundColor: 'rgb(233, 49, 18)',
                borderWidth: 1,
                tension:0.4,
            },
        ],
    }
  return (
    <div className='h-[220px] w-full'>
        <Line 
            options={{ 
            ...options, 
            maintainAspectRatio: false 
        }}
        data={data} />
    </div>
  )
}

export default JoinedChart