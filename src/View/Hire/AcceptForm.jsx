import React from 'react'

const AcceptForm = (props) => {
    const {acceptValues, handleChangeShortlist, errors, processStatus, handleReInterDialog, setopenReInterview, setAcceptDialog} = props
    
    // Create interview rounds dynamically from process_status
    const getInterviewRounds = () => {
        if (!processStatus || typeof processStatus !== 'object') {
            return [];
        }
        
        return Object.keys(processStatus).map(roundKey => {
            // Convert round key to display name
            const displayName = roundKey
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            return {
                key: roundKey,
                name: displayName
            };
        });
    }
    
    const interviewRounds = getInterviewRounds();
    
    // Debug logging
    console.log('AcceptForm - processStatus:', processStatus)
    console.log('AcceptForm - filtered interviewRounds:', interviewRounds)
    
    // Handle Schedule Interview button click
    const handleScheduleInterview = (roundKey) => {
        console.log('Scheduling interview for round:', roundKey)
        // Close the Accept Application modal first
        setAcceptDialog(false)
        // Small delay to ensure smooth modal transition, then open the re-interview modal
        setTimeout(() => {
            setopenReInterview(true)
        }, 100)
    }
    
  return (
    <>
        <div className="p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Interview Round Statuses</h3>
            <div className="space-y-3">
                {interviewRounds.length > 0 ? (
                    interviewRounds.map((round) => {
                        const status = processStatus?.[round.key]
                        const isCompleted = status === 1
                        
                        return (
                            <div key={round.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">
                                        {isCompleted ? '✓' : '?'}
                                    </span>
                                    <span className="text-gray-700 font-medium">
                                        {round.name}
                                    </span>
                                </div>
                                {!isCompleted && (
                                    <button
                                        type="button"
                                        onClick={() => handleScheduleInterview(round.key)}
                                        className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors cursor-pointer"
                                    >
                                        Schedule Interview
                                    </button>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="p-4 text-center text-gray-500">
                        No interview rounds found for this applicant.
            </div>
                )}
            </div>
        </div>
    </>
  )
}

export default AcceptForm 