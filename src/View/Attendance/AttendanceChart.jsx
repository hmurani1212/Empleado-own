import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Import BarElement
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2'; // Import Bar instead of Line

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement, // Register BarElement
  Title,
  Tooltip,
  Legend
);

const AttendanceChart = (props) => {
    const { chartData } = props;
    // console.log('AttendanceChart - chartData:', chartData);
    // console.log('AttendanceChart - chartData type:', typeof chartData);
    // console.log('AttendanceChart - isArray:', Array.isArray(chartData));
    const options = {
        responsive: true,
        scales: {
            x: {
                grid: {
                    display: true, // Set to true to show vertical grid lines on the x-axis
                    color: '#f9f9f9',
                },
            },
            y: {
                grid: {
                    display: true,
                    color: "#f9f9f9",
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
                },
            },
            title: {
                display: false,
                padding: 10,
            },
            maintainAspectRatio: false,
        },
    };

    // Safety check to ensure chartData is an array
    if (!Array.isArray(chartData) || chartData.length < 2) {
        console.error('AttendanceChart: chartData is not a valid array or has insufficient data:', chartData);
        return (
            <div className='w-full h-[400px] px-1 py-2 flex items-center justify-center'>
                <p className='text-gray-500'>No chart data available</p>
            </div>
        );
    }

    const labels = chartData.slice(1).map(row => row[0]); // Extract dates as labels
    const workingHoursData = chartData.slice(1).map(row => row[1]); // Extract working hours

    const data = {
        labels,
        datasets: [
            {
                label: 'Working Hours',
                data: workingHoursData,
                backgroundColor: '#3fb2e6', // Bar color
                borderColor: '#3fb2e6',
                borderWidth: 2,
                borderRadius:5,
                barThickness:30
            },
        ],
    };

    return (
        <div className='w-full h-[400px] px-1 py-2'>
            <Bar 
                data={data} // Use Bar component
                options={{ 
                    ...options, 
                    maintainAspectRatio: false 
                }} 
            />
        </div>
    );
};

export default AttendanceChart;
