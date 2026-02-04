import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { Button } from '@material-tailwind/react'

const LicenseTypeEditAdd = (props) => {
    const { licenseValue, handleSubmitLicense, handleLicenseInputChange, handleSelectLicense, 
        handleSubmitLicenseType

    } = props
  return (
    <>
        {licenseValue.addType ? 
        <div className='space-y-2'>
            <div className='flex items-center justify-between'>
                <div className='flex-1 px-2 space-y-1'>
                    <label className='text-[#698592] text-[12px]'>License Type</label>
                    <input 
                        className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                            licenseValue?.validationErrors?.license_type ? 'border-red-500' : 'border-gray-500'
                        }`}
                        type='text' 
                        value={licenseValue?.license_type}
                        name='license_type' 
                        onChange={handleLicenseInputChange}
                    />
                </div>
            </div>
            <div className='flex justify-end'>
                    <Button 
                        onClick={handleSubmitLicenseType} 
                        variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
                        loading={licenseValue.loading}
                    >
                        <span>Add</span>
                    </Button>
                </div>
        </div>
        :
        (
            <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                    <div className='flex-1 px-2 space-y-1'>
                        <label className='text-[#698592] text-[12px]'>License Title</label>
                        <input 
                            className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                                licenseValue?.validationErrors?.license_title ? 'border-red-500' : 'border-gray-500'
                            }`}
                            type='text' 
                            value={ licenseValue?.license_title}
                            name='license_title' 
                            onChange={handleLicenseInputChange}
                        />
                    </div>
                    <div className='flex-1 px-2 space-y-1'>
                        <label className='text-[#698592] text-[12px]'>License Type</label>
                        {licenseValue?.loadingLicenseTypes ? (
                            <div className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none bg-gray-100'>
                                Loading license types...
                            </div>
                        ) : (
                            <CustomSelect 
                                placeHolderTitle = 'License Type'
                                 value={
                                    licenseValue?.license_type_list?.find(option => option.id ===  licenseValue.license_type) 
                                    ? { value: licenseValue?.license_type_list?.find(option => option.id ===  licenseValue.license_type).id, 
                                        label: licenseValue?.license_type_list?.find(option => option.id === licenseValue.license_type).license_type

                                    }
                                    :
                                    licenseValue.license_type
                                }
                                options={licenseValue?.license_type_list?.map((type) => ({ value: type.id, label:type.license_type}))} 
                                onChangeHandler={(selectedOption) => handleSelectLicense(selectedOption, 'license_type')}
                                customStyles={false}
                                
                            />
                        )}
                    </div>
                    
                </div>
                <div className='flex items-center justify-between'>
                    <div className='flex-1 px-2 space-y-1'>
                        <label className='text-[#698592] text-[12px]'>License Number</label>
                        <input 
                            className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                                licenseValue?.validationErrors?.license_number ? 'border-red-500' : 'border-gray-500'
                            }`}
                            type='text' 
                            value={licenseValue?.license_number} 
                            name='license_number' 
                            onChange={handleLicenseInputChange}
                        />
                    </div>
                    
                </div>
                <div className='flex items-center justify-between'>
                    <div className='flex-1 flex flex-col px-2 space-y-1'>
                        <label className='text-[#698592] text-[12px]'>Issuing Authority Detail</label>
                        <textarea 
                            rows="7" 
                            // cols="50" 
                            name="issuing_authority"
                            value={licenseValue.issuing_authority}
                            className={`text-[#333333] text-[12px] rounded-md py-[10px] px-[17px] border outline-none resize-none ${
                                licenseValue?.validationErrors?.issuing_authority ? 'border-red-500' : 'border-[#cccccc]'
                            }`}
                            onChange={handleLicenseInputChange}
                        ></textarea>
                    </div>
                </div>
                <div className='flex items-center justify-between'>
                    <div className='flex-1 px-2 space-y-1'>
                        <label className='text-[#698592] text-[12px]'>Issue Date</label>
                        <input 
                            className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                                licenseValue?.validationErrors?.issue_date ? 'border-red-500' : 'border-gray-500'
                            }`}
                            type='date' 
                            value={licenseValue?.issue_date} 
                            name='issue_date' 
                            onChange={handleLicenseInputChange}
                        />
                        
                    </div>
                    <div className='flex-1 px-2 space-y-1'>
                        <label className='text-[#698592] text-[12px]'>Expiry Date</label>
                        <input 
                            className={`w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border outline-none ${
                                licenseValue?.validationErrors?.expiry_date ? 'border-red-500' : 'border-gray-500'
                            }`}
                            type='date' 
                            value={licenseValue?.expiry_date} 
                            name='expiry_date' 
                            onChange={handleLicenseInputChange}
                        />
                    </div>
                </div>
                <div className='flex justify-end'>
                    <Button 
                        onClick={handleSubmitLicense} 
                        variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
                        loading={licenseValue.loading}
                    >
                        <span>{licenseValue.addState ? 'Submit' :'Update'}</span>
                    </Button>
                </div>
            </div>
        )
    }
    </>
  )
}

export default LicenseTypeEditAdd