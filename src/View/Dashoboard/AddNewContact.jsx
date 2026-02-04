import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { contactMobileNetwroks, contactTypeList } from '../../services/EmpServices'
import { Button } from '@material-tailwind/react'

const AddNewContact = (props) => {
    const {allCountries, handleSelectAddContactChange, newContactValue, handleSubmitNewContact, handleNewContactChange, empId,
        handleUpdateContact

    } = props
    // console.log('newContactValue', newContactValue)

    // const checkNetwork = contactMobileNetwroks.find((network) => newContactValue.network?.includes(network.networkName))
    // console.log(checkNetwork)

  return (
    <form className='space-y-4 px-5 customScroll'
    >
        <div>
            <label className='text-[#7a929e] text-[12px]'>Select Contact Type</label>
            <CustomSelect
                placeHolderTitle='Contact Type'
                value={contactTypeList?.find(option => option.value === newContactValue.contact_type) 
                        ? { value: contactTypeList?.find(option => option.value === newContactValue.contact_type).value, 
                            label: contactTypeList?.find(option => option.value === newContactValue.contact_type).name
                        }
                        : newContactValue?.contact_type
                    }
                options={contactTypeList?.map((type) => ({ value: type.value, label: type.name }))}
                onChangeHandler={(selectedOption) => handleSelectAddContactChange(selectedOption, 'contact_type')}
                customStyles={false}
            />
        </div>
        <div className='flex flex-col space-y-1'>
            <label className='text-[#7a929e] text-[12px]'>Contact Title</label>
            <input 
                className='text-[#333333] text-[12px] rounded-md py-[10px] px-[5px] border border-[#cccccc] outline-none'
                type='text' value={newContactValue?.contact_title} name='contact_title' 
                onChange={handleNewContactChange}
            />
                                    
        </div>
        {(newContactValue.contact_type.value === 'mobile' || newContactValue.contact_type === 'mobile') ?
            <>
                
                <div className='flex flex-col space-y-1'>
                    <label className='text-[#7a929e] text-[12px]'>Mobile No</label>
                    <input 
                        className='text-[#333333] text-[12px] rounded-md py-[10px] px-[5px] border border-[#cccccc] outline-none'
                        type='text' value={newContactValue?.mobile_no} name='mobile_no' 
                        onChange={handleNewContactChange}
                    />
                                            
                </div>
                <div>
                    <label className='text-[#7a929e]'>Select Country Code</label>
                    <CustomSelect 
                        placeHolderTitle='Country Code'
                         value={
                            allCountries?.find(country => country.id === newContactValue.country_id) 
                            ? { 
                                value: `${allCountries.find(country => country.id === newContactValue.country_id).country_code}#${newContactValue.country}`, 
                                label: allCountries.find(country => country.id === newContactValue.country_id).country_name 
                            } 
                            :newContactValue?.country_id
                        }
                        options={allCountries?.map((country) => ({
                            value: `${country.phonecode}`,
                            label: country.country_name
                        }))}
                        
                        onChangeHandler={(selectedOption) => handleSelectAddContactChange(selectedOption, 'country_code')}
                        customStyle={false}
                    />
                </div>
                <div>
                    <label className='text-[#7a929e] text-[12px]'>Select Network</label>
                    <CustomSelect
                        placeHolderTitle='Network'
                        value={
                            contactMobileNetwroks.find(network => network.value === newContactValue.network )
                                ? { value: newContactValue.network, label: newContactValue.network }
                                : newContactValue.network // Fallback to a default value if no match is found
                        }
                        options={contactMobileNetwroks?.map((type) => ({ value: type.networkName, label: type.networkName }))}
                        onChangeHandler={(selectedOption) => handleSelectAddContactChange(selectedOption, 'network')}
                        customStyles={false}
                    />
                </div>
            </>

            :
           ( newContactValue.contact_type.value === "phone" ||  newContactValue.contact_type === "phone") ?

             <>
                <div className='flex flex-col space-y-1'>
                    <label className='text-[#7a929e] text-[12px]'>Phone No</label>
                    <input 
                        className='text-[#333333] text-[12px] rounded-md py-[10px] px-[5px] border border-[#cccccc] outline-none'
                        type='text' value={newContactValue?.mobile_no} name='mobile_no' 
                        onChange={handleNewContactChange}
                    />
                </div>
                <div>
                   <label className='text-[#7a929e]'>Select Country Code</label>
                    <CustomSelect 
                        placeHolderTitle='Country Code'
                         value={
                            allCountries?.find(country => country.id === newContactValue.country_id) 
                            ? { 
                                value: `${allCountries.find(country => country.id === newContactValue.country_id).country_code}#${newContactValue.country}`, 
                                label: allCountries.find(country => country.id === newContactValue.country_id).country_name 
                            } 
                            :newContactValue?.country_id
                        }
                        options={allCountries?.map((country) => ({
                            value: `${country.phonecode}`,
                            label: country.country_name
                        }))}
                        
                        onChangeHandler={(selectedOption) => handleSelectAddContactChange(selectedOption, 'country_code')}
                        customStyle={false}
                    />
                </div>
                
            </>
            :
             (newContactValue.contact_type.value === "email" || newContactValue.contact_type === "email") ?
            <>
                <div className='flex flex-col space-y-1'>
                    <label className='text-[#7a929e] text-[12px]'>Email Address</label>
                    <input 
                        className='text-[#333333] text-[12px] rounded-md py-[10px] px-[5px] border border-[#cccccc] outline-none'
                        type='email' value={newContactValue?.mobile_no} name='mobile_no' 
                        onChange={handleNewContactChange}
                    />
                </div>
            </>
            :
            <>
                <div className='flex flex-col space-y-1'>
                    <label className='text-[#7a929e] text-[12px]'>Address</label>
                    <input 
                        className='text-[#333333] text-[12px] rounded-md py-[10px] px-[5px] border border-[#cccccc] outline-none'
                        type='text' value={newContactValue?.mobile_no} name='mobile_no' 
                        onChange={handleNewContactChange}
                    />
                </div>
            </>
        }
        <div className='flex gap-4 justify-end'>
            <Button onClick={newContactValue.addState ? ()=>handleSubmitNewContact(empId) : ()=>handleUpdateContact(empId)} variant="gradient" color="blue" className='capitalize text-[12px] px-3 py-2 font-medium'
                loading={newContactValue.loading}    
            >
                <span>{newContactValue.addState ? 'Submit' : 'Update'}</span>
            </Button>
        </div>
        
    </form>
  )
}

export default AddNewContact