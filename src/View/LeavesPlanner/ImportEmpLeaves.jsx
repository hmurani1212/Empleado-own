import { Input, Button } from '@material-tailwind/react'
import React from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'
import excelTemp from '../../assets/template/Empleado-Leave-Balance-Used-Template.xlsx'
import { FaFileExcel, FaUpload, FaCloudUploadAlt } from 'react-icons/fa';

const ImportEmpLeaves = () => {
  return (
    <div className='p-6 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-3xl mx-auto mt-6'>
        
        <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
                <FaCloudUploadAlt size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-poppins mb-2">Import Employee Leaves</h2>
            <p className='text-sm text-gray-500 max-w-lg'>
                Please note that this feature can only be used to import your employees' leaves being used before your Empleado account was created.
            </p>
        </div>

        <div className='flex flex-col gap-6'>
            
            {/* Step 1: Download Template */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-lg text-green-600 shrink-0">
                    <FaFileExcel size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Step 1: Download Template</h3>
                    <p className="text-xs text-gray-500 mb-3">Download the excel template and fill in the required employee leave data.</p>
                    <a 
                        href={excelTemp} 
                        className='text-blue-600 hover:text-blue-700 text-xs font-medium inline-flex items-center gap-1 hover:underline'
                        download
                    >
                        Download Excel Template
                    </a>
                </div>
            </div>

            {/* Step 2: Upload File */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600 shrink-0">
                    <FaUpload size={24} />
                </div>
                <div className="w-full">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Step 2: Upload Data</h3>
                    <p className="text-xs text-gray-500 mb-3">Upload the filled excel file here.</p>
                    
                    <div className="relative">
                        <Input 
                            type='file' 
                            labelProps={{
                                className: "hidden",
                            }}
                            className="!border !border-gray-300 bg-white text-gray-900 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
                            accept=".xlsx, .xls"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button 
                    className="bg-bgBlue shadow-blue-500/20 hover:shadow-blue-500/40 capitalize font-medium px-8 py-2.5 rounded-xl transition-all"
                >
                    Import Data
                </Button>
            </div>

        </div>
    </div>
  )
}

export default ImportEmpLeaves