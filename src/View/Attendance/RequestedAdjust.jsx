import React, { useState } from 'react';
import { Typography } from '@material-tailwind/react';
import { FaEdit, FaTimes } from 'react-icons/fa';
import formatTime from '../../services/__attendanceServices';
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import { Input } from '@material-tailwind/react';
import SubmitButton from '../../Components/SubmitButton/SubmitButton';
import { showToast } from '../../Components/Toaster/Toaster';

function formatDateDisplay(val) {
  if (val == null || val === '') return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTimeSafe(val) {
  if (val == null || val === '') return '—';
  if (typeof val === 'string' && val.includes(':')) return formatTime(val);
  return String(val);
}

function toDateInputValue(val) {
  if (val == null || val === '') return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val).slice(0, 10) || '';
  return d.toISOString().slice(0, 10);
}

/** Format Unix timestamp (seconds) to HH:mm (24-hour) */
function formatUnixToTime(unixSec) {
  if (unixSec == null || Number(unixSec) <= 0) return '—';
  const sec = Number(unixSec);
  const ms = String(Math.floor(sec)).length === 10 ? sec * 1000 : sec;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Format Unix timestamp (seconds) to 12-hour time (e.g. "05:00 PM") */
function formatUnixToTime12(unixSec) {
  if (unixSec == null || Number(unixSec) <= 0) return '—';
  const sec = Number(unixSec);
  const ms = String(Math.floor(sec)).length === 10 ? sec * 1000 : sec;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/** Build rows from form_data actual_in1/actual_out1, etc. when value > 0. Date from form_data.date. Both in and out in 12-hour with AM/PM. */
function buildActualTimeRows(formData) {
  if (!formData || typeof formData !== 'object') return [];
  const date = formData.date ?? '';
  const rows = [];
  for (let n = 1; n <= 10; n++) {
    const inVal = formData[`actual_in${n}`];
    const outVal = formData[`actual_out${n}`];
    const inNum = inVal != null ? Number(inVal) : 0;
    const outNum = outVal != null ? Number(outVal) : 0;
    if (inNum > 0 || outNum > 0) {
      rows.push({
        date,
        in_time: formatUnixToTime12(inVal),
        out_time: formatUnixToTime12(outVal),
      });
    }
  }
  return rows;
}

const RequestedAdjust = ({ onClose }) => {
  const { individualRequestDetail, updateTimeAdjustment, updatedAdjRequest } = useAttendance();
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editForm, setEditForm] = useState({ date: '', in_time: '', out_time: '' });
  const [editingSubmissionId, setEditingSubmissionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const detailList = individualRequestDetail || [];
  const firstItem = detailList[0];

  // Section 1: Adjustment details — actual_in1/actual_out1, etc. when value > 0 (same as Inbox)
  const actualTimeRows = React.useMemo(
    () => (firstItem?.form_data ? buildActualTimeRows(firstItem.form_data) : []),
    [firstItem?.form_data]
  );

  // Section 2: Edit adjustment — date, in_time, out_time from root level (outside form_data), same as Inbox
  const rootTimeRows = React.useMemo(
    () =>
      detailList
        .map((ele) => ({
          _id: ele._id ?? ele.id,
          date: ele.date ?? ele?.form_data?.date ?? '',
          in_time: ele.in_time ?? ele?.form_data?.in_time ?? '',
          out_time: ele.out_time ?? ele?.form_data?.out_time ?? '',
        }))
        .filter((row) => row._id != null),
    [detailList]
  );

  const openEdit = (row) => {
    setEditingSubmissionId(row._id);
    setEditForm({
      date: toDateInputValue(row.date),
      in_time: row.in_time ?? '',
      out_time: row.out_time ?? '',
    });
    setEditDrawerOpen(true);
  };

  const hasSection1Data = actualTimeRows.length > 0;
  const hasSection2Data = rootTimeRows.length > 0;

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingSubmissionId) {
      showToast('Cannot update: missing submission id', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await updateTimeAdjustment(
        editingSubmissionId,
        editForm.in_time,
        editForm.out_time
      );
      if (result?.success) {
        showToast('Time adjustment updated successfully', 'success');
        updatedAdjRequest({
          _id: editingSubmissionId,
          in_time: editForm.in_time,
          out_time: editForm.out_time,
        });
        setEditDrawerOpen(false);
        setEditingSubmissionId(null);
      } else {
        showToast(result?.error || 'Failed to update time adjustment', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white h-full flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <h2 className="text-[#3DA5F4] font-semibold text-lg">Requested Adjustment</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex justify-center cursor-pointer items-center rounded-full border-2 border-blue-500 hover:bg-blue-50 transition-colors"
            title="Close"
            aria-label="Close"
          >
            <FaTimes className="text-blue-500" size={14} />
          </button>
        )}
      </div>

      <div className="mt-4 flex-1 px-6 pb-6 space-y-6">
        {/* Section 1: Table — Date, In time, Out time (read-only) */}
        <div>
          <h3 className="text-gray-700 font-medium text-sm mb-3">Actual Time</h3>
          <div className="bg-white rounded-[10px] drop-shadow-md overflow-x-auto border border-gray-100">
            <table className="w-full min-w-max text-center">
              <thead className="bg-[#F8F9FA]">
                <tr>
                  <th className="py-4 px-2">
                    <Typography variant="small" color="#292929" className="font-medium font-Urbanist capitalize">
                      Date
                    </Typography>
                  </th>
                  <th className="py-4 px-2">
                    <Typography variant="small" color="#292929" className="font-medium font-Urbanist capitalize">
                      In time
                    </Typography>
                  </th>
                  <th className="py-4 px-2">
                    <Typography variant="small" color="#292929" className="font-medium font-Urbanist capitalize">
                      Out time
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {hasSection1Data ? (
                  actualTimeRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {formatDateDisplay(row.date)}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {row.in_time}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {row.out_time}
                        </Typography>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      No adjustment data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Root-level date, in_time, out_time + Edit button (same as Inbox) */}
        <div>
          <h3 className="text-gray-700 font-medium text-sm mb-3">Requested Adjustment Time</h3>
          <div className="bg-white rounded-[10px] drop-shadow-md overflow-x-auto border border-gray-100">
            <table className="w-full min-w-max text-center">
              <thead className="bg-[#F8F9FA]">
                <tr>
                  <th className="py-4 px-2">
                    <Typography variant="small" color="#292929" className="font-medium font-Urbanist capitalize">
                      Date
                    </Typography>
                  </th>
                  <th className="py-4 px-2">
                    <Typography variant="small" color="#292929" className="font-medium font-Urbanist capitalize">
                      In time
                    </Typography>
                  </th>
                  <th className="py-4 px-2">
                    <Typography variant="small" color="#292929" className="font-medium font-Urbanist capitalize">
                      Out time
                    </Typography>
                  </th>
                  <th className="py-4 px-2 w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {hasSection2Data ? (
                  rootTimeRows.map((row, idx) => (
                    <tr key={row._id ?? idx} className="hover:bg-gray-50 border-b border-gray-200">
                      <td className="p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {formatDateDisplay(row.date)}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {formatTimeSafe(row.in_time)}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography variant="small" color="blue-gray" className="font-normal">
                          {formatTimeSafe(row.out_time)}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex items-center cursor-pointer justify-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 text-[#3DA5F4] hover:bg-blue-50 transition-colors text-sm font-medium"
                          title="Edit"
                          aria-label="Edit adjustment"
                        >
                          <FaEdit size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No adjustment data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side modal: Date, In time, Out time + Update button */}
      <PortalDrawer
        open={editDrawerOpen}
        closeDrawer={() => {
          setEditDrawerOpen(false);
          setEditingSubmissionId(null);
        }}
        widthSize={420}
        title="Edit time adjustment"
        compo={
          <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
            <Input
              label="Date"
              type="date"
              name="date"
              value={editForm.date}
              onChange={handleEditChange}
              color="blue"
              readOnly
            />
            <Input
              label="In time"
              type="time"
              name="in_time"
              value={editForm.in_time}
              onChange={handleEditChange}
              color="blue"
            />
            <Input
              label="Out time"
              type="time"
              name="out_time"
              value={editForm.out_time}
              onChange={handleEditChange}
              color="blue"
            />
            <div className="pt-2">
              <SubmitButton title="Update" loading={loading} />
            </div>
          </form>
        }
      />
    </div>
  );
};

export default RequestedAdjust;
