import { Button, Input, Popover, PopoverContent, PopoverHandler } from '@material-tailwind/react'
import React from 'react'
import useHire from '../../ViewModel/HireViewModel/HireServices'
import Calendar from 'react-calendar'

const ActivateVacancyForm = (props) => {
  const {handleCalendar, deactiveValues} = useHire()
  const {handlaActivateForm, handleChangeActive} = props
 
  return (
    <>
    <form onSubmit={handlaActivateForm}>
        <div>
        {/* <div className="py-2">
                <Popover placement="bottom">
                  <PopoverHandler>
                    <Input
                      label="Start Date"
                      name='start_date'
                      // value={deactiveValues.start_date}
                    />
                  </PopoverHandler>
                  <PopoverContent>
                    <Calendar 
                    // onChange={(selected)=>handleCalendar(selected, 'start_date')}  
                      className='border-0'
                    />
                    </PopoverContent>
                </Popover>
              </div> */}
            <div className='py-2'>
                <Input label='Start Date' type='date' color='blue' name='start_date' value={deactiveValues.start_date} onChange={handleChangeActive}/>
            </div>

            <div className='py-2'>
                <Input label='End Date' type='date' color='blue' name='end_date' value={deactiveValues.end_date} onChange={handleChangeActive}/>
            </div>

            <div className='py-2'>
              <Button type='submit' color='blue' className="cursor-pointer">Submit</Button>

            </div>
        </div>
    </form>
    </>
  )
}

export default ActivateVacancyForm