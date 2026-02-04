import { Input, Rating, Textarea } from '@material-tailwind/react'
import React from 'react'

const InterviewScoreComp = (props) => {
    const {handleInterviewScore, scoreInterview, handleChangeShortlist, handleChangeRating} = props
  return (
    <>
    <form onSubmit={(e) =>handleInterviewScore(e)}>
        <div>
            <div className='py-2'>
                <div className='flex justify-between'>
                    <span></span>
                    <div><Rating unratedColor="amber" ratedColor="amber" name='rating844' onChange={(value) => handleChangeRating('rating844', value)}/></div>
                </div>

            </div>
            
            <div className='py-2'>
                <Input label='Interview Time' type='datetime-local' color='blue' name='interview_time' 
                value={scoreInterview.interview_time} onChange={handleChangeShortlist} 
                >
                </Input>
            </div>

            <div className='py-2'>
                <Textarea label='Comments' color='blue' name='commentsI' 
                value={scoreInterview.commentsI} onChange={handleChangeShortlist} 
                >
                </Textarea>

            </div>
            </div>


    </form>
    </>
  )
}

export default InterviewScoreComp