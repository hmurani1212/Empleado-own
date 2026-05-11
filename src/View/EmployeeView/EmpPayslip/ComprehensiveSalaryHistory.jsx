import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";

const formatMoney = (value) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return "0";
    return numeric.toLocaleString();
};

const resolveDeductionDescription = (item = {}) => {
    const candidate =
        item?.description ??
        item?.detail ??
        item?.details ??
        item?.remarks ??
        item?.remark ??
        item?.note ??
        item?.notes ??
        item?.desc;

    if (candidate == null) return "---";
    const value = String(candidate).trim();
    return value ? value : "---";
};

const formatUnixDate = (timestamp, fallbackDate = "", placeholder = "---", rejectEpoch = false) => {
    if (timestamp != null && timestamp !== "" && Number(timestamp) > 0) {
        const date = new Date(Number(timestamp) * 1000);
        if (!Number.isNaN(date.getTime())) {
            if (rejectEpoch && date.getFullYear() === 1970) {
                return placeholder;
            }
            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        }
    }

    if (fallbackDate) {
        const date = new Date(fallbackDate);
        if (!Number.isNaN(date.getTime())) {
            if (rejectEpoch && date.getFullYear() === 1970) {
                return placeholder;
            }
            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        }
    }
    return placeholder;
};

const HistorySection = ({ title, count, headers, rows, emptyMessage }) => {
    return (
        <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 text-white font-semibold" style={{ backgroundColor: "#3DA5F4" }}>
                {title} ({count || 0})
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {headers.map((head) => (
                                <th key={head} className="py-3 px-4 text-left font-semibold text-gray-600">
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.length > 0 ? (
                            rows
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="py-5 px-4 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const ComprehensiveSalaryHistory = ({ comprehensiveSalaryData, isLoading, mode = "all" }) => {
    const dbData = comprehensiveSalaryData?.DB_DATA || {};
    const incrementHistory = dbData?.increments?.increment_details || [];
    const incentiveHistory = dbData?.incentives?.incentive_details || [];
    const deductionHistory = dbData?.deductions?.deduction_details || [];

    if (isLoading) {
        return (
            <Card className="rounded-2xl shadow-card border border-gray-100">
                <CardBody className="p-6">
                    <Typography className="text-gray-600 font-medium">Loading salary details...</Typography>
                </CardBody>
            </Card>
        );
    }

    const showIncrements = mode === "all" || mode === "increments";
    const showIncentives = mode === "all" || mode === "incentives_deductions" || mode === "incentives";
    const showDeductions = mode === "all" || mode === "incentives_deductions" || mode === "deductions";

    const incentivesSection = (
        <HistorySection
            title="Incentive History"
            count={dbData?.incentives?.incentive_count}
            headers={["Title", "Amount", "Recurring", "Start Date", "End Date"]}
            rows={incentiveHistory.map((item) => (
                <tr key={item.id}>
                    <td className="py-3 px-4 text-gray-700">{item.title || "---"}</td>
                    <td className="py-3 px-4 text-gray-700">{formatMoney(item.amount)}/-</td>
                    <td className="py-3 px-4 text-gray-700">{item.re_occuring || "---"}</td>
                    <td className="py-3 px-4 text-gray-700">{formatUnixDate(item.start_date, item.start_date_formatted)}</td>
                    <td className="py-3 px-4 text-gray-700">
                        {String(item?.re_occuring || "").trim().toLowerCase() === "yes"
                            ? "Unlimited"
                            : formatUnixDate(item.end_date, item.end_date_formatted, "--", true)}
                    </td>
                </tr>
            ))}
            emptyMessage="No incentive history found."
        />
    );

    const deductionsSection = (
        <HistorySection
            title="Deduction History"
            count={dbData?.deductions?.deduction_count}
            headers={["Title", "Amount", "Recurring", "Description"]}
            rows={deductionHistory.map((item) => (
                <tr key={item.id}>
                    <td className="py-3 px-4 text-gray-700">{item.title || "---"}</td>
                    <td className="py-3 px-4 text-gray-700">{formatMoney(item.amount)}/-</td>
                    <td className="py-3 px-4 text-gray-700">{item.re_occuring || "---"}</td>
                    <td className="py-3 px-4 text-gray-600">{resolveDeductionDescription(item)}</td>
                </tr>
            ))}
            emptyMessage="No deduction history found."
        />
    );

    return (
        <div className="space-y-6">
            {showIncrements && (
                <HistorySection
                    title="Increment History"
                    count={dbData?.increments?.increment_count}
                    headers={["Effective Date", "Type", "Amount", "Detail"]}
                    rows={incrementHistory.map((item) => (
                        <tr key={item.id}>
                            <td className="py-3 px-4 text-gray-700">{formatUnixDate(item.effective_from, item.effective_from_date)}</td>
                            <td className="py-3 px-4 text-gray-700 capitalize">{item.type || "---"}</td>
                            <td className="py-3 px-4 text-gray-700">{formatMoney(item.calculated_value || item.amount)}/-</td>
                            <td className="py-3 px-4 text-gray-600">{item.detail || "---"}</td>
                        </tr>
                    ))}
                    emptyMessage="No increment history found."
                />
            )}

            {mode === "incentives_deductions" && (showIncentives || showDeductions) ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {showIncentives && incentivesSection}
                    {showDeductions && deductionsSection}
                </div>
            ) : (
                <>
                    {showIncentives && incentivesSection}
                    {showDeductions && deductionsSection}
                </>
            )}
        </div>
    );
};

export default ComprehensiveSalaryHistory;
