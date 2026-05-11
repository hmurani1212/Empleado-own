import React, { useMemo } from 'react'
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
import { attendanceColorData } from '../../services/__attendanceServices';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const colorByAttCode = (code) =>
    attendanceColorData.find((d) => String(d.att).toUpperCase() === String(code).toUpperCase())?.color ||
    '#64748b';

const CHART_LINE_COLORS = {
    workingHours: colorByAttCode('P'),
    lateMinutes: colorByAttCode('A'),
    overtime: colorByAttCode('MA'),
    earlyLeave: colorByAttCode('EL'),
};

function formatDayMonthLabel(value) {
    if (value == null) return '';
    const s = String(value).trim();
    let d;

    const ymd = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymd) {
        const [, y, m, day] = ymd;
        d = new Date(Number(y), Number(m) - 1, Number(day));
    } else {
        const dMonY = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
        if (dMonY) {
            const [, day, mon, y] = dMonY;
            const monthIndex = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(String(mon).toLowerCase());
            if (monthIndex >= 0) d = new Date(Number(y), monthIndex, Number(day));
        }
        const dmy = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/);
        if (!d && dmy) {
            const [, day, m, y] = dmy;
            d = new Date(Number(y), Number(m) - 1, Number(day));
        } else if (!d) {
            const parsed = new Date(s);
            d = Number.isNaN(parsed.getTime()) ? null : parsed;
        }
    }

    if (!d) return s;
    const day = d.toLocaleString('en-GB', { day: '2-digit' });
    const month = d.toLocaleString('en-GB', { month: 'short' });
    return `${day} ${month}`;
}

const getLateMinutesFromRecord = (record) => {
    if (!record) return 0;
    const v =
        record.late_minutes ??
        record.late_minute ??
        record.late_mins_adjusted ??
        record.late_mins ??
        0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const getOvertimeHours = (record) => {
    if (!record) return 0;
    const sec = Number(record.overtime) || 0;
    return Math.round((sec / 3600) * 100) / 100;
};

const getEarlyLeaveMinutesFromRecord = (record) => {
    if (!record) return 0;
    const m = Number(record.early_leave_minutes ?? 0);
    return Number.isFinite(m) ? m : 0;
};

/**
 * Ensure matrix has Working Hours + Late Minutes + Overtime + Early Leave (min) columns,
 * enriching from daily attendance when the API only returns Date + hours.
 */
const normalizeChartMatrix = (matrix, attendanceList) => {
    if (!Array.isArray(matrix) || matrix.length < 2) return matrix;

    const rawHeader = (matrix[0] || []).map((h) => String(h ?? '').trim());
    const headerLower = rawHeader.map((h) => h.toLowerCase());

    const findCol = (patterns) => {
        for (const p of patterns) {
            const i = headerLower.findIndex((h) => h.includes(p));
            if (i >= 0) return i;
        }
        return -1;
    };

    const idxDate = 0;
    const idxWh =
        findCol(['working hour', 'earned hour', 'completed hour']) >= 0
            ? findCol(['working hour', 'earned hour', 'completed hour'])
            : rawHeader.length > 1
              ? 1
              : -1;
    const idxLate = findCol(['late']);
    const idxOt = findCol(['overtime', 'ot ']);
    const idxEarly = findCol(['early leave', 'early']);

    const standardHeader = ['Date', 'Working Hours', 'Late Minutes', 'Overtime (hrs)', 'Early Leave (min)'];

    if (idxWh >= 0 && idxLate >= 0 && idxOt >= 0 && idxEarly >= 0) {
        const body = matrix.slice(1).map((row) => [
            String(row[idxDate] ?? ''),
            Number(row[idxWh] ?? 0) || 0,
            Number(row[idxLate] ?? 0) || 0,
            Number(row[idxOt] ?? 0) || 0,
            Number(row[idxEarly] ?? 0) || 0,
        ]);
        return [standardHeader, ...body];
    }

    const rows = matrix.slice(1).map((row) => {
        const label = String(row[idxDate] ?? '');
        const wh = idxWh >= 0 ? Number(row[idxWh] ?? 0) : 0;
        const rec = attendanceList?.find((r) => String(r.date_string) === label) ?? null;

        const late =
            idxLate >= 0 ? Number(row[idxLate] ?? 0) || 0 : getLateMinutesFromRecord(rec);
        const ot = idxOt >= 0 ? Number(row[idxOt] ?? 0) || 0 : getOvertimeHours(rec);
        const early =
            idxEarly >= 0 ? Number(row[idxEarly] ?? 0) || 0 : getEarlyLeaveMinutesFromRecord(rec);

        return [label, wh, late, ot, early];
    });

    return [standardHeader, ...rows];
};

const buildChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    scales: {
        x: {
            grid: {
                display: true,
                color: '#f9f9f9',
            },
            ticks: {
                callback: function (value) {
                    const raw = this.getLabelForValue(value);
                    return formatDayMonthLabel(raw);
                },
                autoSkip: true,
                maxRotation: 45,
                minRotation: 0,
                color: '#64748b',
                font: { size: 11, weight: '500' },
            },
        },
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            grid: {
                display: true,
                color: '#f9f9f9',
            },
            title: {
                display: true,
                text: 'Hours',
                color: '#64748b',
                font: { size: 11, weight: '500' },
            },
            ticks: {
                color: '#64748b',
                font: { size: 11, weight: '500' },
                precision: 0,
            },
        },
        y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            grid: {
                drawOnChartArea: false,
            },
            title: {
                display: true,
                text: 'Minutes',
                color: '#64748b',
                font: { size: 11, weight: '500' },
            },
            ticks: {
                color: '#64748b',
                font: { size: 11, weight: '500' },
                precision: 0,
            },
        },
    },
    plugins: {
        legend: {
            position: 'top',
            align: 'start',
            labels: {
                usePointStyle: true,
                boxWidth: 10,
                boxHeight: 5,
                color: '#334155',
                font: { size: 12, weight: '600' },
            },
        },
        title: {
            display: false,
        },
        tooltip: {
            callbacks: {
                title: (items) => formatDayMonthLabel(items?.[0]?.label),
                label(ctx) {
                    const ds = ctx.dataset || {};
                    const v = ctx.parsed?.y ?? ctx.raw;
                    if (ds.yAxisID === 'y') return `${ds.label}: ${v} h`;
                    if (ds.yAxisID === 'y1') return `${ds.label}: ${v} min`;
                    return `${ds.label}: ${v}`;
                },
            },
        },
    },
});

const lineDatasetStyle = (borderColor, borderWidth = 2.2) => ({
    borderColor,
    backgroundColor: borderColor,
    borderWidth,
    tension: 0.35,
    fill: false,
    pointRadius: 2,
    pointHoverRadius: 5,
    pointBackgroundColor: '#fff',
    pointBorderColor: borderColor,
    pointBorderWidth: 1.5,
});

const MonthlyWorkingHoursChart = ({ attendanceData }) => {
    const attendanceList = attendanceData?.attendanceAttr?.attendance;

    const { labels, workingHoursData, lateMinutesData, overtimeData, earlyLeaveMinutesData } = useMemo(() => {
        const rawMatrix =
            Array.isArray(attendanceData?.chartData) && attendanceData.chartData.length >= 1
                ? attendanceData.chartData
                : [
                      ['Date', 'Working Hours', 'Late Minutes', 'Overtime (hrs)', 'Early Leave (min)'],
                      ['02/Sep', 0, 0, 0, 0],
                      ['03/Sep', 0, 0, 0, 0],
                      ['04/Sep', 0, 0, 0, 0],
                      ['05/Sep', 0, 0, 0, 0],
                      ['06/Sep', 0, 0, 0, 0],
                      ['07/Sep', 0, 0, 0, 0],
                  ];

        const chartMatrix = normalizeChartMatrix(rawMatrix, attendanceList);

        const lab = [];
        const wh = [];
        const late = [];
        const ot = [];
        const earlyMin = [];

        for (let i = 1; i < chartMatrix.length; i++) {
            const row = chartMatrix[i] || [];
            lab.push(String(row[0] ?? ''));
            wh.push(Number(row[1] ?? 0));
            late.push(Number(row[2] ?? 0));
            ot.push(Number(row[3] ?? 0));
            earlyMin.push(Number(row[4] ?? 0));
        }

        return {
            labels: lab,
            workingHoursData: wh,
            lateMinutesData: late,
            overtimeData: ot,
            earlyLeaveMinutesData: earlyMin,
        };
    }, [attendanceData?.chartData, attendanceList]);

    const chartData = useMemo(() => ({
        labels,
        datasets: [
            {
                label: 'Working hours',
                data: workingHoursData,
                yAxisID: 'y',
                ...lineDatasetStyle(CHART_LINE_COLORS.workingHours, 3),
            },
            {
                label: 'Overtime',
                data: overtimeData,
                yAxisID: 'y',
                ...lineDatasetStyle(CHART_LINE_COLORS.overtime, 3),
            },
            {
                label: 'Late',
                data: lateMinutesData,
                yAxisID: 'y1',
                ...lineDatasetStyle(CHART_LINE_COLORS.lateMinutes, 3),
            },
            {
                label: 'Early leave',
                data: earlyLeaveMinutesData,
                yAxisID: 'y1',
                ...lineDatasetStyle(CHART_LINE_COLORS.earlyLeave, 3),
            },
        ],
    }), [labels, workingHoursData, lateMinutesData, overtimeData, earlyLeaveMinutesData]);

    const chartOptions = useMemo(() => buildChartOptions(), []);

    if (!labels.length) {
        return (
            <div className="flex h-full min-h-[220px] w-full flex-col items-center justify-center px-6 text-center">
                <p className="text-sm font-medium text-gray-600">No chart data</p>
                <p className="mt-1 max-w-xs text-xs text-gray-400">Select an employee and month to load attendance trends.</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <Line data={chartData} options={chartOptions} />
        </div>
    );
};

export default MonthlyWorkingHoursChart
