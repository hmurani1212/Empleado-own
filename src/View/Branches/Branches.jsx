import { Button, Card, CardBody, Option, Select } from '@material-tailwind/react'
import React, { useEffect } from 'react'
import { BiSearch } from 'react-icons/bi'
// import useBranches from '../../ViewModel/BranchesViewModel/BranchesServices'
import useBranches2 from '../../ViewModel/Brach2ViewModel/BranchesServices2';

import CustomDrawer from '../../Components/CustomDrawer/CustomDrawer'
import CreateNewBranch from './CreateNewBranch'
import BranchesList from './BranchesList'
import CustomButton from '../../Components/CustomButton/CustomButton'
import '../../index.css'


const Branches = () => {
  const { branchStatus, statusBranch, mountBranch, creatingNewBranch, branchesAllnew, handleChangeBranch, showDrawer, formatPhoneNumberTable, OpenAddBranchDrawer, closeBranchDrawer, gettingAllBranchesNew, currentFilterStatus, isLoading } = useBranches2()
  const data = ['Branch ID', 'Branch Name', 'Branch Admin', 'Currency', 'Phone', 'Email', 'Creation Time', 'Actions']

  useEffect(() => {
    // if(!mountBranch){
    const data = {
      status: 1,
      page: 1,
      limit: 10
    }
    gettingAllBranchesNew(data)
    // }
  }, []);


  //console.log(" branchesAllnew branchesAllnew", branchesAllnew)

  return (
    <>
      <div className='flex justify-between lg:px-2 md:px-2 px-0 py-2'>
        <span className='text-[20px] text-[#474747] text-center font-Urbanist font-semibold'>Branch Management</span>
      </div>

      <div>
        <div className='w-full'>
          <div className='py-6 lg:px-2 md:px-2 px-0 space-y-4'>
            <div className='relative w-90 min-w-[200px] flex lg:flex-row md:flex-row flex-col lg:items-end md:items-end items-start gap-3 justify-between'>
              <div className='flex lg:flex-row md:flex-row flex-col gap-3'>
                <div className='lg:w-[200px] md:w-[200px] w-full'>
                  <label className='text-[12px] text-[#474747] font-Urbanist font-medium px-2'>Select Status</label>
                  <Select labelProps={{className: 'hidden'}} className='h-[38px] text-[12px] text-[#474747] font-Urbanist bg-white outline-none border-none drop-shadow-md '  onChange={(val) => statusBranch(val)} value={currentFilterStatus.toString()}>
                    {branchStatus?.map((ele) => (
                      <Option value={`${ele.status}`} key={ele.id}>{ele.title}</Option>
                    ))}
                  </Select>
                </div>
                <div className='lg:w-[200px] md:w-[200px] w-full'>
                  <label className='text-[12px] text-[#474747] font-Urbanist font-medium px-2'>Search Branch</label>
                  <div className="relative w-full min-w-[200px] h-[38px] bg-white rounded-[7px] px-3 drop-shadow-md ">
                    <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
                      <span>
                        <BiSearch />
                      </span>
                    </div>
                    <input
                      className="w-full h-full bg-transparent text-[#474747] border-none outline-none text-[12px] font-Urbanist rounded-[7px]"
                      placeholder="Search Branch" name='searchBranch' onChange={handleChangeBranch} />
                  </div>
                </div>
              </div>
              <div>
                <CustomButton title='Create New Branch' onClick={creatingNewBranch} />
              </div>

            </div>
            <BranchesList
              data={data}
              loading={isLoading}
              gettingAllBranchesNew={gettingAllBranchesNew}
              branchesAll={branchesAllnew}
              formatPhoneNumberTable={formatPhoneNumberTable}
              currentFilterStatus={currentFilterStatus}
            />
          </div>
        </div>
      </div>

      <CustomDrawer
        open={showDrawer}
        closeDrawer={closeBranchDrawer}
        compo={<CreateNewBranch
          closeBranchDrawer={closeBranchDrawer}
        />}
        title="Create New Branch"
        widthSize={620}
      />


    </>
  )
}

export default Branches