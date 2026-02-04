import { Drawer, Input, Button, Typography } from '@material-tailwind/react'
import React from 'react'
import useShiftManagement from '../../ViewModel/ShiftManagementViewModel/ShiftManagementServices'

const RosterDialog = () => {
    const { rosterValues, handleRosterChange, handleDownloadRoster, isDownloadingRoster } = useShiftManagement()

    return (
        <div className="space-y-4">
            <div>
                <Input
                    type="date"
                    label="Date From"
                    name="dateFrom"
                    value={rosterValues.dateFrom}
                    onChange={handleRosterChange}
                    color="blue"
                />
            </div>
            <div>
                <Input
                    type="date"
                    label="Date Upto"
                    name="dateUpto"
                    value={rosterValues.dateUpto}
                    onChange={handleRosterChange}
                    color="blue"
                />
            </div>
            <div className="pt-4">
                <Button
                    onClick={handleDownloadRoster}
                    color="blue"
                    className="w-full"
                    loading={isDownloadingRoster}
                    disabled={isDownloadingRoster}
                >
                    Download
                </Button>
            </div>
        </div>
    )
}

export default RosterDialog