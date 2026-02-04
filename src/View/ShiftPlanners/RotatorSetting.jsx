import { Input, Radio, Typography, Drawer, Button } from '@material-tailwind/react';
import React, { useEffect } from 'react'
import { FaClock } from "react-icons/fa";
import SubmitButton from '../../Components/SubmitButton/SubmitButton';
import useShiftManagement from '../../ViewModel/ShiftManagementViewModel/ShiftManagementServices';

const RotatorSetting = (props) => {

    // Tooba
    // Rotator Settings
    const {allRotatorStatus,allRotatorClock} = props
    const {changeRotatorSetting, rotatorSettingValues, handleChangeRotator, handleRotatorRadioChange, openRosterDialog, handleRosterDialog, rosterValues, handleRosterChange, handleDownloadRoster, gettingAllShift, allShiftData, isUpdatingRotator, isDownloadingRoster} = useShiftManagement()

    const headRotator = ['Shift', 'On Rotator', 'Off Rotator']

    // useEffect(() => {
    //     console.log("_______))))))))", allRotatorStatus)
    //     // gettingAllShift()
    //     // console.log("?/???????????????", allShiftData)
    // })

  return (
    <>
    <form onSubmit={(e) => changeRotatorSetting(e)}>
        <div className='grid grid-cols-2 gap-4'>
            <div className='border-r-2'>
                <div>
                    <span className='text-[12px]'>
                    Changing status of any shift below will cause changes in an employee timings. So you are advised to take a new printout of the roaster.
                    </span>
                </div>

                <div>
                    <table>
                        <thead>
                            <tr>
                                {headRotator?.map((head, i) => (
                                    <th key={i} 
                                    className="border-b border-blue-gray-100 p-4"
                                    >
                                        <Typography
                                        variant='small'
                                        color='blue-gray'
                                        className="font-semibold leading-none opacity-70 capitalize"                      
                                        >
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>  
                        </thead>

                        <tbody>
                            {allRotatorStatus.DB_DATA?.map((ele, index) => {
                                return(
                                    <tr key={index}>
                                        <td>
                                            <Typography
                                            variant="small"
                                            color="blue-gray"
                                            className="font-semibold"
                                            >
                                                {ele.shift_name}
                                            </Typography>
                                        </td>
                                        <td>
                                            <Radio 
                                            name={`rotator_${ele.shift_id}`}
                                            label='Yes' 
                                            color='blue'
                                            checked={ele.status === 1}
                                            onChange={() => handleRotatorRadioChange(`shift_${ele.shift_id}`, 'on')}
                                            />
                                        </td>
                                        <td>
                                            <div className='flex items-center justify-between'>
                                                <Radio 
                                                name={`rotator_${ele.shift_id}`}
                                                label='Yes' 
                                                color='blue'
                                                checked={ele.status === 0}
                                                onChange={() => handleRotatorRadioChange(`shift_${ele.shift_id}`, 'off')}
                                                />
                                                {ele.status === 1 && (
                                                    <button 
                                                    type='button'
                                                    className='text-blue-500 text-sm hover:underline ml-4'
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        console.log('Roster button clicked')
                                                        handleRosterDialog()
                                                    }}
                                                    >
                                                        Roster
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {/* <tr>
                                <td>
                                    <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-semibold"
                                    >
                                        Morning
                                    </Typography>
                                </td>
                                <td>
                                    <Radio 
                                    name="morningRotator" 
                                    label='Yes' 
                                    color='blue'
                                    checked={rotatorSettingValues.onRotator === 'on'}
                                    onChange={() => {
                                        console.log('On Rotator clicked')
                                        handleRotatorRadioChange('onRotator', 'on')
                                    }}
                                    />
                                </td>
                                <td>
                                    <div className='flex items-center justify-between'>
                                        <Radio 
                                        name="morningRotator" 
                                        label='Yes' 
                                        color='blue'
                                        checked={rotatorSettingValues.onRotator === 'off'}
                                        onChange={() => handleRotatorRadioChange('onRotator', 'off')}
                                        />
                                        {rotatorSettingValues.onRotator === 'on' && (
                                            <button 
                                            type='button'
                                            className='text-blue-500 text-sm hover:underline ml-4'
                                            onClick={() => {
                                                console.log('Roster button clicked')
                                                handleRosterDialog()
                                            }}
                                            >
                                                Roster
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr> */}
                        </tbody>
                    </table>


                </div>
            </div>

            <div className='text-[12px] flex flex-col space-y-4'> 
                <div className='flex items-center gap-3 '>
                    <div>
                    <FaClock className='text-[#ffa5008f] text-[25px]'/>
                    </div>
                    <div>
                        AntiClockwise Rotation
                    </div>
                </div>

                <div className='flex gap-1 items-center'>
                    <div>Rotate after</div>
                    <div className='w-100'>
                        
                            <div>
                                <Input
                                type='number'
                                color='blue'
                                label='Days'
                                name = 'period'
                                value={rotatorSettingValues.period || allRotatorClock?.DB_DATA?.rotator_data?.period_days || ''}                                onChange={handleChangeRotator}
                                className='w-[70px]'
                                />
                            </div>
                            
                    </div>

                    <div>Days</div>
                </div>

                <div className='flex  gap-1 items-center'>
                    <div>With effect from</div>

                    <div>
                        <Input label='Date' color='blue' type='date' name='from' value={rotatorSettingValues.from} onChange={handleChangeRotator}/>
                    </div>

                    <div><SubmitButton loading={isUpdatingRotator} /></div>
                </div>

                <div className='flex gap-2'>
                    <div>Next Rotation</div>
                    <div className='text-[#ffa5008f]'>{rotatorSettingValues.from || 'Please schedule above'}</div>
                </div>

                
            </div>
        </div>
    </form>
    
    {openRosterDialog && <Drawer open={openRosterDialog} onClose={handleRosterDialog} placement="right" size={500} className="p-4">
        <div className="mb-6 flex justify-between items-center">
            <Typography variant="h5" color="blue-gray">
                Shift Roster
            </Typography>
            <Button
                onClick={handleRosterDialog}
                variant="text"
                size="sm"
                className="p-1"
            >
                ✕
            </Button>
        </div>
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
    </Drawer> }
    </>
  )
}

export default RotatorSetting