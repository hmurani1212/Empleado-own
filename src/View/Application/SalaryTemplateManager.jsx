import React, { useState, useEffect } from 'react'
import { Button, Input, Select, Option } from '@material-tailwind/react'
import useStore from '../../Store/store'
import { showToast } from '../../Components/Toaster/Toaster'

function SalaryTemplateManager() {
    // Get functions from store
    const gettingSalaryTemp = useStore((state) => state.gettingSalaryTemp)
    const allSalaryTemp = useStore((state) => state.allSalaryTemp)
    const branches_payroll = useStore((state) => state.branches_payroll)
    const getAllBranchesPayroll = useStore((state) => state.getAllBranchesPayroll)
    const salaryTempSearch = useStore((state) => state.salaryTempSearch)

    // Local state for filters
    const [filters, setFilters] = useState({
        branch_id: null,
        search: '',
        page: 0,
        limit: 10
    })

    // Loading states
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingBranches, setIsLoadingBranches] = useState(false)

    // Load branches on component mount
    useEffect(() => {
        loadBranches()
    }, [])

    // Load salary templates when filters change
    useEffect(() => {
        if (filters.branch_id) {
            loadSalaryTemplates()
        }
    }, [filters.branch_id, filters.search, filters.page])

    const loadBranches = async () => {
        setIsLoadingBranches(true)
        try {
            await getAllBranchesPayroll(true) // Force reload
        } catch (error) {
            console.error('Error loading branches:', error)
            showToast('Failed to load branches', 'error')
        } finally {
            setIsLoadingBranches(false)
        }
    }

    const loadSalaryTemplates = async () => {
        if (!filters.branch_id) {
            showToast('Please select a branch first', 'warning')
            return
        }

        setIsLoading(true)
        try {
            await gettingSalaryTemp(
                filters.branch_id,
                filters.search,
                filters.page,
                filters.limit,
                true // Force reload
            )
        } catch (error) {
            console.error('Error loading salary templates:', error)
            showToast('Failed to load salary templates', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleBranchChange = (selectedOption) => {
        // console.log('Branch changed:', selectedOption)
        setFilters(prev => ({
            ...prev,
            branch_id: selectedOption?.value || null,
            page: 0 // Reset to first page when branch changes
        }))
    }

    const handleSearchChange = (e) => {
        const searchValue = e.target.value
        // console.log('Search changed:', searchValue)
        setFilters(prev => ({
            ...prev,
            search: searchValue,
            page: 0 // Reset to first page when search changes
        }))
    }

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }))
    }

    const handleLimitChange = (newLimit) => {
        setFilters(prev => ({
            ...prev,
            limit: parseInt(newLimit),
            page: 0 // Reset to first page when limit changes
        }))
    }

    const handleRefresh = async () => {
        if (!filters.branch_id) {
            showToast('Please select a branch first', 'warning')
            return
        }
        
        setIsLoading(true)
        try {
            await gettingSalaryTemp(
                filters.branch_id,
                filters.search,
                filters.page,
                filters.limit,
                true // Force reload
            )
            showToast('Salary templates refreshed successfully!', 'success')
        } catch (error) {
            console.error('Error refreshing salary templates:', error)
            showToast('Failed to refresh salary templates', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='w-full bg-white p-6 rounded-lg shadow-md'>
            <h3 className='text-lg font-semibold text-gray-800 mb-6'>Salary Template Manager</h3>
            
            {/* Filters Section */}
            <div className='flex flex-col gap-4 mb-6'>
                <div className='flex flex-wrap gap-4'>
                    {/* Branch Filter */}
                    <div className='w-full md:w-1/3'>
                        <Select
                            color="blue"
                            label="Select Branch"
                            placeholder="Choose branch"
                            value={filters.branch_id}
                            onChange={handleBranchChange}
                            disabled={isLoadingBranches}
                        >
                            {branches_payroll?.map((branch) => (
                                <Option key={branch.id} value={branch.id}>
                                    {branch.branch_name}
                                </Option>
                            ))}
                        </Select>
                        {isLoadingBranches && (
                            <small className="text-blue-600 text-xs mt-1">Loading branches...</small>
                        )}
                    </div>

                    {/* Search Filter */}
                    <div className='w-full md:w-1/3'>
                        <Input
                            color="blue"
                            className='!h-11 !rounded-6'
                            label="Search Templates"
                            placeholder='Search by name...'
                            value={filters.search}
                            onChange={handleSearchChange}
                        />
                    </div>

                    {/* Limit Filter */}
                    <div className='w-full md:w-1/4'>
                        <Select
                            color="blue"
                            label="Items per page"
                            value={filters.limit.toString()}
                            onChange={handleLimitChange}
                        >
                            <Option value="5">5 per page</Option>
                            <Option value="10">10 per page</Option>
                            <Option value="20">20 per page</Option>
                            <Option value="50">50 per page</Option>
                        </Select>
                    </div>

                    {/* Refresh Button */}
                    <div className='w-full md:w-1/6 flex items-end'>
                        <Button
                            color="green"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isLoading || !filters.branch_id}
                            className='w-full'
                            variant="outlined"
                        >
                            {isLoading ? 'Loading...' : '🔄 Refresh'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className='w-full'>
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="text-blue-600">Loading salary templates...</div>
                    </div>
                ) : !filters.branch_id ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Please select a branch to view salary templates</div>
                    </div>
                ) : allSalaryTemp?.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">No salary templates found</div>
                    </div>
                ) : (
                    <>
                        {/* Results Count */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">
                                Showing {allSalaryTemp?.length} salary template(s)
                                {filters.search && ` for "${filters.search}"`}
                            </p>
                        </div>

                        {/* Templates List */}
                        <div className="space-y-4">
                            {allSalaryTemp?.map((template) => (
                                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 text-lg mb-2">{template.name}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-700">Salary Amount:</span>
                                                    <span className="ml-2 text-gray-600">{template.currency} {template.salary_amount}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Overtime Rate:</span>
                                                    <span className="ml-2 text-gray-600">{template.overtime_rate}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Branch:</span>
                                                    <span className="ml-2 text-gray-600">{template.branch_name}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-700">Created:</span>
                                                    <span className="ml-2 text-gray-600">{template.creation_time}</span>
                                                </div>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-400">
                                                ID: {template.id} • Dept ID: {template.deptt_id} • Org ID: {template.org_id}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <Button size="sm" color="blue" variant="outlined">
                                                Edit
                                            </Button>
                                            <Button size="sm" color="red" variant="outlined">
                                                Delete
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                color="gray" 
                                                variant="outlined"
                                                onClick={handleRefresh}
                                                disabled={isLoading}
                                                title="Refresh this template"
                                            >
                                                🔄
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-6">
                            <div className="text-sm text-gray-600">
                                Page {filters.page + 1} • {filters.limit} items per page
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outlined"
                                    onClick={() => handlePageChange(Math.max(0, filters.page - 1))}
                                    disabled={filters.page === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outlined"
                                    onClick={() => handlePageChange(filters.page + 1)}
                                    disabled={allSalaryTemp?.length < filters.limit}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Debug Info (remove in production) */}
            <div className="mt-6 p-3 bg-gray-100 rounded text-xs">
                <strong>Debug Info:</strong><br/>
                Branch ID: {filters.branch_id || 'Not selected'}<br/>
                Search: "{filters.search}"<br/>
                Page: {filters.page}<br/>
                Limit: {filters.limit}<br/>
                Templates Count: {allSalaryTemp?.length || 0}
            </div>
        </div>
    )
}

export default SalaryTemplateManager
