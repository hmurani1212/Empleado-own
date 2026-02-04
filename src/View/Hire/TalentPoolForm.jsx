import { Input, Textarea } from '@material-tailwind/react'
import React from 'react'

const TalentPoolForm = (props) => {
    const {addTalentPoolValues, handleChangeShortlist} = props
  return (
    <>
    <form>
        <div>
            <div className='py-4'>
                <Input 
                    label='Label' 
                    color='blue' 
                    name='labelTalent' 
                    value={addTalentPoolValues.labelTalent} 
                    onChange={handleChangeShortlist}
                />
            </div>

            <div className='py-4'>
                <Textarea 
                    label='Talent Description' 
                    color='blue' 
                    name='talent' 
                    value={addTalentPoolValues.talent} 
                    onChange={handleChangeShortlist}
                    placeholder="Enter talent description (e.g., Strong analytical skills with leadership potential)"
                />
            </div>
        </div>
    </form>
    </>
  )
}

export default TalentPoolForm