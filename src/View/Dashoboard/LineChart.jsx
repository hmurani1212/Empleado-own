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



function formatDayMonthLabel(value) {
  if (value == null) return ''

  // Common formats we receive: "YYYY-MM-DD", "DD-MM-YYYY", "DD-MMM-YYYY" (02-Apr-2026), or already formatted.
  const s = String(value).trim()
  let d

  const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (ymd) {
    const [, y, m, day] = ymd
    d = new Date(Number(y), Number(m) - 1, Number(day))
  } else {
    const dMonY = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/)
    if (dMonY) {
      const [, day, mon, y] = dMonY
      const monthIndex = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(String(mon).toLowerCase())
      if (monthIndex >= 0) d = new Date(Number(y), monthIndex, Number(day))
    }
    const dmy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/)
    if (!d && dmy) {
      const [, day, m, y] = dmy
      d = new Date(Number(y), Number(m) - 1, Number(day))
    } else {
      if (!d) {
        const parsed = new Date(s)
        d = Number.isNaN(parsed.getTime()) ? null : parsed
      }
    }
  }

  if (!d) return s

  const day = d.toLocaleString('en-GB', { day: '2-digit' })
  const month = d.toLocaleString('en-GB', { month: 'short' })
  return `${day} ${month}`
}

const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },

    scales: {
        x: {
            grid: {
                display: true, // Set to true to show vertical grid lines on the x-axis
                color: '#f9f9f9'
            },
            ticks: {
              callback: function (value) {
                // `this.getLabelForValue` gives the original label for the tick index.
                const raw = this.getLabelForValue(value)
                return formatDayMonthLabel(raw)
              },
              color: '#64748b',
              font: { size: 11, weight: '500' },
            },
        },
        y: {
            grid: {
                display: true, 
                color: "#f9f9f9"
            },
            beginAtZero: true,
            ticks: {
              color: '#64748b',
              font: { size: 11, weight: '500' },
              precision: 0,
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
                color: '#334155',
                font: { size: 12, weight: '600' },
            }
        },
        title: {
            display: false,
            padding: 10
        },
        tooltip: {
          callbacks: {
            title: (items) => formatDayMonthLabel(items?.[0]?.label),
          },
        },
        maintainAspectRatio: false,
    },
};



const LineChart = () => {

const { empLate_absent_labels, absentEmployeesData, lateComersChartData, presentEmployeesChartData } = useDashboard()

    // Keep raw labels for stable/dynamic chart updates; format only for display (ticks/tooltip).
    const labels = empLate_absent_labels || [];
    const data = {
        labels,
        datasets: [
            {
                label: 'Present Employees',
                data: presentEmployeesChartData || [],
                borderColor: '#22c55e',
                backgroundColor: '#22c55e',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 2,
                pointHoverRadius: 5,
              },
            {
                label: 'Absent Employees',
                data: absentEmployeesData || [],
                borderColor: '#ef4444',
                backgroundColor: '#ef4444',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 2,
                pointHoverRadius: 5,
            },
            {
                label: 'Late Comers',
                data: lateComersChartData || [],
                borderColor: '#f59e0b',
                backgroundColor: '#f59e0b',
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 2,
                pointHoverRadius: 5,
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