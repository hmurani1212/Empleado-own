import { Input, Option, Select, Textarea } from '@material-tailwind/react'
import React from 'react'
import useHire from '../../ViewModel/HireViewModel/HireServices'

const ReInterview = (props) => {
    const { allRounds, handleReInterviewData, Re_Interviewfn, Re_Interview_data } = useHire()
    const { handleChangeRound, viewAppId, handleChangeShortlist, reInterviewData } = props
    return (
        <>
            <form onSubmit={(e) => handleReInterviewData(e)}>
                <div className='py-2'>
                    <div className='flex'>
                        <div className='mr-2'>Dear</div>
                        <div className='font-semibold'>{viewAppId.name}</div>
                    </div>

                    <div className='py-2'>
                        <Input label='Interview Label' color='blue' name='re_label' value={reInterviewData.re_label} onChange={handleChangeShortlist}></Input>
                    </div>

                    <div className='py-2'>
                        <Select label='Shortlist for round' color='blue' name='re_round_id' onChange={(value) => handleChangeRound('re_round_id', value)}>
                            {allRounds?.map((ele) => (
                                <Option value={ele.id} key={ele.id}>{ele.round_name}</Option>
                            ))}
                        </Select>
                    </div>

                    <div className='py-2'>
                        <Input label='Interview Time' type='datetime-local' color='blue' name='reInterview_time' value={reInterviewData.reInterview_time} onChange={handleChangeShortlist} ></Input>
                    </div>

                    <div className='py-2'>
                        <Textarea label='Comments' color='blue' name='re_comment' value={reInterviewData.re_comment} onChange={handleChangeShortlist}>

                        </Textarea>
                    </div>
                </div>
            </form>

        </>
    )
}

export default ReInterview