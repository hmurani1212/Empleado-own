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
                display: true, // Set to true to show vertical grid lines on the x-axis
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
        legend: {
            align: 'start',
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



const LineChart = () => {

const { empLate_absent_labels, absentEmployeesData, lateComersChartData } = useDashboard()

    const labels = empLate_absent_labels;
    const data = {
        labels,
        datasets: [
            {
                label: 'Late Comers',
                data: lateComersChartData || [],
                borderColor: 'rgb(233, 49, 18)',
                backgroundColor: 'rgb(233, 49, 18)',
                borderWidth: 2, 
                tension:0.4,
            },
            {
                label: 'Absent Employees',
                data: absentEmployeesData || [],
                borderColor: 'rgb(10, 207, 151)',
                backgroundColor: 'rgb(10, 207, 151)',
                borderWidth: 2,
                tension:0.4,
            },
        ],
    }

  return (
    <div className='w-full h-full'>
        <Line data={data}
            options={{ 
            ...options, 
            maintainAspectRatio: false 
            
        }} 
        />
    </div>
  )
}

export default LineChart