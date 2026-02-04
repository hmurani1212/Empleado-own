import React, { useState } from 'react'
import { Button } from '@material-tailwind/react'
import CreateChecklist from './CreateChecklist'
import CustomDrawer from '../../Components/CustomDrawer/CustomDrawer'

const ChecklistDemo = () => {
    const [showDrawer, setShowDrawer] = useState(false)

    const openDrawer = () => {
        setShowDrawer(true)
    }

    const closeDrawer = () => {
        setShowDrawer(false)
    }

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Checklist Management</h1>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Employee Onboarding Checklists</h2>
                    <p className="text-gray-600 mb-6">
                        Create and manage employee onboarding checklists for different departments.
                    </p>
                    
                    <Button
                        onClick={openDrawer}
                        className="capitalize font-medium bg-[#8bc9f8] px-6 py-2"
                    >
                        Add New Checklist
                    </Button>
                </div>

                {/* Drawer for creating checklist */}
                {showDrawer && (
                    <CustomDrawer
                        open={showDrawer}
                        closeDrawer={closeDrawer}
                        compo={<CreateChecklist closeDrawer={closeDrawer} />}
                        title="Create New Checklist"
                        widthSize={600}
                    />
                )}
            </div>
        </div>
    )
}

export default ChecklistDemo
