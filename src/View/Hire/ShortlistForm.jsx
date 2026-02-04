import { Input, Option, Select, Textarea } from '@material-tailwind/react'
import React from 'react'
import useHire from '../../ViewModel/HireViewModel/HireServices'

const ShortlistForm = (props) => {
    const {allRounds,  addToShortlist} = useHire()
    const {addShortlistValues, handleChangeShortlist, handleChangeRound} = props
  return (
    <>
    <form onSubmit={(e) => addToShortlist(e)}>
        <div>
            <div className='py-2'>
                <Select 
                    label='Shortlist for round' 
                    color='blue' 
                    name='round_id' 
                    value={addShortlistValues.round_id}
                    onChange={(value) => handleChangeRound('round_id', value)}
                >
                    {allRounds?.map((ele)=> (
                        <Option value={ele.id} key={ele.id}>{ele.round_name}</Option>
                    ))}
                </Select>
            </div>

            <div className='py-2'>
                <Input 
                    label='Data Label' 
                    color='blue' 
                    name='label' 
                    value={addShortlistValues.label} 
                    onChange={handleChangeShortlist}
                />
            </div>

            <div className='py-2'>
                <Input 
                    label='Interview Time' 
                    type='datetime-local' 
                    color='blue' 
                    name='interviewTime' 
                    value={addShortlistValues.interviewTime} 
                    onChange={handleChangeShortlist}
                    min={new Date().toISOString().slice(0, 16)}
                />
            </div>

            <div className='py-2'>
                <Textarea 
                    label='Comments' 
                    color='blue' 
                    name='comment' 
                    value={addShortlistValues.comment} 
                    onChange={handleChangeShortlist}
                />
            </div>
        </div>
    </form>
    </>
  )
}

export default ShortlistForm