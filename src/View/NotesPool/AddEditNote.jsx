import React from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'

const AddEditNote = (props) => {
    const { handleChangeNote,  addNoteValue, handleSelectNotebook, handleSubmitNote} = props
    
  return (
    <form
        onSubmit={handleSubmitNote}
        className='space-y-3'
    >
        {addNoteValue.showNoteBook && 
            <div className='flex-1 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Notebook</label>
                <CustomSelect 
                    placeHolderTitle = 'Notebook'
                    value={ addNoteValue?.notebook_id}
                    options={addNoteValue.notebooks?.map((notebook) => ({ 
                        value: notebook?.id || notebook?._id || notebook?.notebook_id,
                        label: notebook?.notebook_title || notebook?.notebook_name || notebook?.name
                    }))}
                    onChangeHandler={(selectedOption) => handleSelectNotebook(selectedOption, 'notebook_id')}
                    customStyles={false}
                />
            </div>
        }
        <div className='space-y-2'>
            <label className='text-[#698592] text-[12px]'>Notebook Title</label>
            <input 
                className='w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none'
                type='text' 
                value={addNoteValue.note_title}
                name='note_title' 
                onChange={handleChangeNote}
                placeholder='Notebook Title'
            />
        </div>
        <div>
            <CustomButton 
            title={addNoteValue.update ? 'Update' : 'Submit' }
            type='submit'
              loading={addNoteValue.loading}
            />
        </div>
    </form>
  )
}

export default AddEditNote