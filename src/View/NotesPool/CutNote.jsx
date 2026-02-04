import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import CustomButton from '../../Components/CustomButton/CustomButton'

const CutNote = (props) => {
    const { addNoteValue, handleSelectCutNotebook, handlePastSubmit } = props

  return (
    <form className='space-y-3' onSubmit={handlePastSubmit}>
        <div className='text-green-400'>
            <span>Please select a Notebook to paste</span>
        </div>
        <div className='flex flex-col gap-3'>
            <label className='text-[#698592] text-[12px]'>Select Notebook</label>
             <div className='w-96'>
                <CustomSelect 
                    placeHolderTitle = 'Notebook'
                    options = {addNoteValue?.notebookList?.map((ele)=> ({value:ele.id, label:ele.notebook_title}))}
                    cStyle = {false}
                    onChangeHandler = {(select)=> handleSelectCutNotebook(select, 'cutNotebook_id')}

                    value={addNoteValue?.cutNotebook_id}

                />
            </div>
        </div>
        <div>
            <CustomButton 
                title = 'Paste'
                type="submit"
                loading= {addNoteValue.loading}
            />
        </div>
    </form>
  )
}

export default CutNote