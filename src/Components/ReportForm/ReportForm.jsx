import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, Radio, Typography } from '@material-tailwind/react';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../Toaster/Toaster';
import useStore from '../../Store/store';

const ReportForm = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('bug');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const closeDrawer = useStore((state) => state.closeDrawer);
  const { 
    reportsHistory, 
    reportsHistoryLoading, 
    getBugReportSuggestions,
    submitBugReport 
  } = useStore();

  const tabs = [
    { id: 'active', label: 'Active Report' },
    { id: 'history', label: 'History' },
    { id: 'unapproved', label: 'Unapproved' }
  ];

  // Fetch history when History tab is opened
  useEffect(() => {
    if (activeTab === 'history') {
      getBugReportSuggestions();
    }
  }, [activeTab, getBugReportSuggestions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!reportTitle.trim()) {
      showToast('Please enter a report title', 'error');
      return;
    }
    
    if (!description.trim()) {
      showToast('Please enter a description', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await submitBugReport({
        report_title: reportTitle,
        report_type: reportType,
        description: description
      });
      
      if (result.success) {
        showToast('Report submitted successfully!', 'success');
        
        // Reset form
        setReportTitle('');
        setReportType('bug');
        setDescription('');
        
        // Refresh history
        await getBugReportSuggestions();
        
        // Close drawer after successful submission
        setTimeout(() => {
          closeDrawer();
        }, 1500);
      } else {
        showToast(result.error || 'Failed to submit report. Please try again.', 'error');
      }
      
    } catch (error) {
      console.error('Error submitting report:', error);
      showToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActiveReportContent = () => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Report Title */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">
          Report Title
        </label>
        <Input
          type="text"
          placeholder="Enter report title"
          value={reportTitle}
          onChange={(e) => setReportTitle(e.target.value)}
          className="!border-gray-300 focus:!border-brand-500 focus:!ring-brand-500"
          labelProps={{
            className: "hidden"
          }}
        />
      </div>

      {/* Report Type - Radio Buttons */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-gray-700">
          Report Type
        </label>
        <div className="flex flex-row gap-6">
          <Radio
            name="report-type"
            value="bug"
            checked={reportType === 'bug'}
            onChange={() => setReportType('bug')}
            label={
              <Typography className="text-gray-700 text-sm">
                Bug Report
              </Typography>
            }
            color="blue"
            size="sm"
          />
          <Radio
            name="report-type"
            value="suggestion"
            checked={reportType === 'suggestion'}
            onChange={() => setReportType('suggestion')}
            label={
              <Typography className="text-gray-700 text-sm">
                Suggestion
              </Typography>
            }
            color="blue"
            size="sm"
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-700">
          Description
        </label>
        <Textarea
          placeholder="Enter detailed description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="!border-gray-300 focus:!border-brand-500 focus:!ring-brand-500 min-h-[150px]"
          labelProps={{
            className: "hidden"
          }}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );

  const getStatusLabel = (status) => {
    // Status: 0 = Pending, 1 = Resolved (based on API response structure)
    return status === '0' || status === 0 ? 'Pending' : 'Resolved';
  };

  const getStatusColor = (status) => {
    return status === '0' || status === 0 
      ? 'bg-yellow-100 text-yellow-700' 
      : 'bg-green-100 text-green-700';
  };

  const renderHistoryContent = () => {
    if (reportsHistoryLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <Typography className="text-sm text-gray-400 mt-4">Loading...</Typography>
        </div>
      );
    }

    if (!reportsHistory || reportsHistory.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <Typography className="text-sm">No history available</Typography>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
              <tr>
                <th className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                  <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                    S.No
                  </Typography>
                </th>
                <th className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                  <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                    Report Title
                  </Typography>
                </th>
                <th className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                  <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                    Status
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reportsHistory.map((report, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="p-4 first:pl-6 text-center">
                    <Typography className="text-sm font-medium text-gray-700">
                      {index + 1}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <Typography className="text-sm font-medium text-gray-900">
                      {report.report_title || 'N/A'}
                    </Typography>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderUnapprovedContent = () => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <Typography className="text-sm">No unapproved reports</Typography>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-brand-500 rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'active' && renderActiveReportContent()}
            {activeTab === 'history' && renderHistoryContent()}
            {activeTab === 'unapproved' && renderUnapprovedContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReportForm;
