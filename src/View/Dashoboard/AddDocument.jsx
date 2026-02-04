import { Button } from '@material-tailwind/react'
import React from 'react'

const AddDocument = (props) => {
    const { handleDocumentInputChange, documentValue, handleDocumentFileChange, 
        handleSubmitDocument

    } = props 
  return (
    <div className='space-y-2'>
        <div className='flex items-center justify-between'>
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Document Title</label>
                <input 
                    className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                        documentValue?.validationErrors?.title ? 'border-red-500' : 'border-gray-500'
                    }`}
                    type='text' 
                    placeholder='Max 50 characters'
                    value={ documentValue?.title}
                    name='title' 
                    onChange={handleDocumentInputChange}
                />
            </div>
            
            <div className='flex-1 px-2 space-y-1'>
                <label className='text-[#698592] text-[12px]'>Name</label>
                <label className="block">
                    <input type="file" className={`w-full text-sm cursor-pointer
                        py-[8px] pr-[17px] pl-2 border rounded-md outline-none
                        file:mr-3 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#97cef8]/60 file:text-[#3da5f4]
                        hover:file:bg-[#97cef8] ${
                            documentValue?.validationErrors?.file ? 'border-red-500' : 'border-gray-500'
                        }`}
                        onChange={handleDocumentFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                </label>
            </div>
                 {/* {documentValue.fileUploading && (
                    <div className="w-full bg-gray-300 rounded-full h-1 mt-2">
                        <div
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${documentValue.uploadProgress}%` }}
                        />
                    </div>
                )}  */}
        </div>
        <div className='flex justify-end'>
            <Button 
                onClick={handleSubmitDocument} 
                variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
                loading={documentValue.loading}
            >
                <span>Submit</span>
            </Button>
        </div>
    </div>
  )
}

export default AddDocument