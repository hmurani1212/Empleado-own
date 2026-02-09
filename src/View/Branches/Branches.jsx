import { Button, Card, CardBody, Option, Select } from '@material-tailwind/react'
import React, { useEffect } from 'react'
import { BiSearch } from 'react-icons/bi'
// import useBranches from '../../ViewModel/BranchesViewModel/BranchesServices'
import useBranches2 from '../../ViewModel/Brach2ViewModel/BranchesServices2';

import CustomDrawer from '../../Components/CustomDrawer/CustomDrawer'
import CreateNewBranch from './CreateNewBranch'
import BranchesList from './BranchesList'
import CustomButton from '../../Components/CustomButton/CustomButton'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
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
      <div className="min-h-screen bg-gray-50/50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                Branch Management
              </h1>
              <p className="text-sm text-gray-500 font-poppins mt-1">
                Manage your organization's branches and locations
              </p>
            </div>
            
            <div className='flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full lg:w-auto'>
               <div className='w-full md:w-48'>
                  <CustomSelect 
                    placeHolderTitle="Select Status"
                    value={branchStatus.find(status => status.status === currentFilterStatus) ? { value: currentFilterStatus, label: branchStatus.find(status => status.status === currentFilterStatus).title } : null}
                    options={branchStatus.map(ele => ({ value: ele.status, label: ele.title }))}
                    onChangeHandler={(option) => statusBranch(option.value)}
                    customStyles={false}
                  />
               </div>

               <div className="relative w-full md:w-64 h-[42px] bg-white rounded-xl border border-gray-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <BiSearch className="text-gray-400 text-lg" />
                  </div>
                  <input
                    type="text"
                    className="w-full h-full bg-transparent text-sm text-gray-700 font-poppins pl-10 pr-4 rounded-xl focus:outline-none placeholder:text-gray-400"
                    placeholder="Search Branch..."
                    name='searchBranch' 
                    onChange={handleChangeBranch} 
                  />
               </div>

               <CustomButton 
                 title='Create New Branch' 
                 onClick={creatingNewBranch} 
                 className="bg-bgBlue text-white hover:bg-blue-600 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 font-medium transition-all flex items-center justify-center gap-2 h-[42px] w-full md:w-auto"
               >
                 <span className="text-lg">+</span> Create New Branch
               </CustomButton>
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