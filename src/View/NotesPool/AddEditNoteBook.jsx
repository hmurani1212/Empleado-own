import React from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'

const AddEditNoteBook = (props) => {
  const { notesValue, handleSubmitNoteBook, handleNoteBookInputChange } = props
  return (
    <form onSubmit={handleSubmitNoteBook}
      className='space-y-3'
    >
      <div className='space-y-2'>
        <label className='text-[#698592] text-[12px]'>Notebook Title</label>
        <input 
            className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
            type='text' 
            value={notesValue.name}
            name='name' 
            onChange={handleNoteBookInputChange}
            placeholder='Notebook Title'
        />
      </div>
      <div>
        <CustomButton 
          title={notesValue.update ? 'Update' : 'Submit' }
          type='submit'
          loading={notesValue.loading}
        />
      </div>
    </form>
  )
}

export default AddEditNoteBook