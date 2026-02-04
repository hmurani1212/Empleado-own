import React from 'react'
import { Button, Typography, Badge, Progress } from '@material-tailwind/react'
import { formatTimestampToDate } from '../../services/__dateTimeServices'

const ViewGoal = ({ goalData, onClose, onEdit, onUpdate }) => {
    const getStatusText = (status) => {
        switch (status) {
            case "0": return "Not Started"
            case "1": return "In Progress"
            case "2": return "Completed"
            default: return "Unknown"
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "0": return "gray"
            case "1": return "blue"
            case "2": return "green"
            default: return "gray"
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high": return "red"
            case "medium": return "yellow"
            case "low": return "green"
            default: return "gray"
        }
    }

    const getProgressColor = (progress) => {
        if (progress >= 80) return "green"
        if (progress >= 50) return "yellow"
        if (progress >= 20) return "blue"
        return "gray"
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Typography variant="h5" color="blue-gray">
                    Goal Details
                </Typography>
                <div className="flex gap-2">
                    {onUpdate && (
                        <Button
                            variant="filled"
                            color="blue"
                            onClick={onUpdate}
                            className="flex items-center gap-2"
                        >
                            Update Goal
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        color="blue"
                        onClick={onEdit}
                        className="flex items-center gap-2"
                    >
                        Edit Goal
                    </Button>
                    <Button
                        variant="outlined"
                        color="gray"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            Goal Name
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                            {goalData.goal_name}
                        </Typography>
                    </div>

                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            Description
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                            {goalData.description}
                        </Typography>
                    </div>

                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            Priority
                        </Typography>
                        <Badge color={getPriorityColor(goalData.priority?.label)}>
                            {goalData.priority?.label}
                        </Badge>
                    </div>

                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            Status
                        </Typography>
                        <Badge color={getStatusColor(goalData.status)}>
                            {getStatusText(goalData.status)}
                        </Badge>
                    </div>
                </div>

                {/* Dates and Progress */}
                <div className="space-y-4">
                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            Start Date
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                            {goalData.start_date}
                        </Typography>
                    </div>

                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            End Date
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                            {goalData.end_date}
                        </Typography>
                    </div>

                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            Progress
                        </Typography>
                        <div className="flex items-center gap-2">
                            <Progress 
                                value={goalData.progress || 0} 
                                color={getProgressColor(goalData.progress || 0)}
                                className="w-24"
                            />
                            <Typography variant="small" color="blue-gray">
                                {goalData.progress || 0}%
                            </Typography>
                        </div>
                    </div>

                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            Score
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                            {goalData.score || 0}
                        </Typography>
                    </div>
                </div>
            </div>

            {/* Employee and Review Cycle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                        Assigned Employee
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray">
                        {goalData.selectedEmp?.[0]?.label} ({goalData.selectedEmp?.[0]?.value})
                    </Typography>
                </div>

                <div>
                    <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                        Review Cycle
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray">
                        {goalData.pID?.label}
                    </Typography>
                </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
                {goalData.comment && (
                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            Comment
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                            {goalData.comment}
                        </Typography>
                    </div>
                )}

                {goalData.rating && (
                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            Rating
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                            {goalData.rating}
                        </Typography>
                    </div>
                )}

                {goalData.createdAt && (
                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-1">
                            Created At
                        </Typography>
                        <Typography variant="paragraph" color="blue-gray">
                            {formatTimestampToDate(goalData.createdAt)}
                        </Typography>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ViewGoal
