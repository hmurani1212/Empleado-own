import { Accordion, AccordionBody, AccordionHeader, Button, Typography } from '@material-tailwind/react'
import React, { useState } from 'react'
import { BsDownload, BsEyeFill, BsPlus, BsTrash2 } from 'react-icons/bs'
import { CiEdit } from 'react-icons/ci'
import useEmployeeDocument from '../../ViewModel/EmployeeViewModel/EmployeeDocument'
import CustomDialog from '../../Components/CustomDialog/CustomDialog'
import AddEditEducation from './AddEditEducation'
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog'
import { AddEditExperience } from './AddEditExperience'
import useExperienceService from '../../ViewModel/EmployeeViewModel/ExperienceServices'
import useDependentsServices from '../../ViewModel/EmployeeViewModel/DependentServices'
import AddEditDependents from './AddEditDependents'
import useLicenseServices from '../../ViewModel/EmployeeViewModel/LicenseServices'
import LicenseTypeEditAdd from './LicenseTypeEditAdd'
import useReferenceService from '../../ViewModel/EmployeeViewModel/RefrenceService'
import AddReference from './AddReference'
import useDocumentServices from '../../ViewModel/EmployeeViewModel/DocumentService'
import AddDocument from './AddDocument'


					
					

const academicHeader = ['Degree/ Certificate', 'Obtained Marks', 'Total Marks', 'Grade',	'Board/Uni', 'Remarks', 'Action']
const ExperieneHeader = ['Org/Institute', 'Designation', 'Duration', 'Salary',	'Leaving Reason', 'Action']
const DepandantsHeader = ['Name', 'Gender', 'Relation', 'Date of Birth',	'Contact', 'Action']
const LicensesHeader = ['License Type', 'Title', 'License#', 'Issuing Aurhority',	'Issue date', 'Expiry date', 'Action']
const RefrencesHeader = ['Name', 'Source', 'Relation', 'Contact',	'Address']
const DocumentsHeader = ['Delete', 'Title', 'View']

const displayValue  =(marks)=>{
  const data = marks.toString().replace(/(\.\d*?[1-9])0+$|\.0*$/, '$1')
  return data
}

const EmployeeDocuments = (props) => {
  const { data } = props

  const academicsData = data.academics;
  const experienceData = data.experiencesData;
  const depandantsData = data.depandants;
  const licensesData = data.licensesData;
  const refrencesData = data.refrenceData;
  const documentsData = data.documentsData;
  const empID = data.empView.section.empId
  
  const {academicsValue, handleAccedemicAdd, handleAccedemicAddClose,
    handleSelectAcademic, handleAcademicInputChange, handleSubmitAcademics,
    deleteAcademic, deleteAcademicValue,toggleDeleteAcademic, confirmDeleteAcademic,
    getSingleAcademic

  } = useEmployeeDocument()

  const { handleExperienceAdd, experienceValue, handleExperienceAddClose,
    getSingleExpirence, handleExpeirenceInputChange,handleSubmitExperience,
    deleteExperience,deleteExperienceValue, confirmDeleteExperience, toggleDeleteExpirence

  } = useExperienceService()


  const {dependentsValue, handleDependentAdd, handleDepedentsAddClose,
    getSingleDependents, handleSubmitDependents, handleDependentsInputChange,
    deleteDependent, deleteDependentValue, confirmDeleteDependent, toggleDeleteDependent

  } = useDependentsServices()


  const {licenseValue, handleLicenseAdd, handleLicenseTypeAdd,
    handleLicenseAddClose,handleSubmitLicense,getSingleLicense,
    handleLicenseInputChange,handleSelectLicense, 
    deleteLicenseValue, confirmDeleteLicense,toggleDeleteLicense, deleteLicense,
    handleSubmitLicenseType


  } = useLicenseServices();


  const { referenceValue , handleReferenceAdd, handleReferenceAddClose, handleSelectReference,
    handleReferenceInputChange,handleSubmitReference

  } = useReferenceService()


  const {deleteDocumentValue,toggleDeleteDocument,deleteDoument,confirmDeleteDocument,
    documentValue, handleDocumentAdd, handleDocumentAddClose,handleDocumentInputChange,handleDocumentFileChange,
    handleSubmitDocument, handleDocumentView
  } =  useDocumentServices()

  const [open, setOpen] = useState(null);
  const handleOpen = (value) => setOpen(open === value ? null : value);
  function Icon({ id, open }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={`${open === id ? "rotate-180" : ""} h-5 w-5 transition-transform`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    );
  }

  const accordionData = [
    {
      id: 1,
      title: "Academics",
      content: (
        <div>
          <div className='flex justify-end'>
            <Button className='p-2 capitalize text-[12px] flex items-center gap-1' color='blue'
              onClick={()=>handleAccedemicAdd(empID)}
            >
              <BsPlus />
              Add Academics
            </Button>
          </div>
          <div>
          <table className="w-full min-w-max table-auto text-start">
              <thead>
                <tr>
                  {academicHeader.map((head) => (
                    <th
                      key={head}
                      className="py-4 text-left"
                    >
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="leading-none font-semibold"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {academicsData?.map((ele, i)=>(
                  <tr key={i}>
                    <td className='py-2'>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {ele?.degree_title}
                      </Typography>
                    </td>
                    <td className='py-2'>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {displayValue(ele?.obtained_marks_gpa)}
                      </Typography>
                    </td>
                    <td className='py-2'>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {displayValue(ele?.total_marks_gpa)}
                      </Typography>
                    </td>
                    <td className='py-2'>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {`${ele?.grade} - ${ele.division == 1 ? '1st' :  ele.division == 2 ? '2nd' : '3rd'} Division`}
                      </Typography>
                    </td>
                    <td className='py-2'>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                       {ele.board_univ} 
                      </Typography>
                    </td>
                    <td className='py-2'>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {ele?.remarks}
                      </Typography>
                    </td>
                    <td className='py-2'>
                      <div className='flex  items-center gap-2'>
                        <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                          onClick={()=>getSingleAcademic(ele.id, empID )}
                        ><CiEdit /></span>
                        <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                          onClick={()=>deleteAcademic(ele.id, empID )}
                        ><BsTrash2 /></span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Experience",
      content: (
        <div>
          <div className='flex justify-end'>
            <Button className='p-2 capitalize text-[12px] flex items-center gap-1' color='blue'
              onClick={()=>handleExperienceAdd(empID)}
            >
              <BsPlus />
              Add Experience
            </Button>
          </div>
          <div>
            <table className="w-full min-w-max table-auto text-start">
                <thead>
                  <tr>
                    {ExperieneHeader.map((head) => (
                      <th
                        key={head}
                        className="py-4 text-left"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="leading-none font-semibold"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {experienceData?.map((ele, i)=>(
                    <tr key={i}>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.org_name}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.designation}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {`${ele?.from_date} - ${ele?.to_date}`}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.salary}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.leave_reason} 
                        </Typography>
                      </td>
                    
                      <td className='py-2'>
                        <div className='flex  items-center gap-2'>
                          <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                            onClick={()=>getSingleExpirence(ele.id, empID)}
                          ><CiEdit /></span>
                          <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                            onClick={()=>deleteExperience(ele.id, empID )}
                          ><BsTrash2 /></span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Dependents",
      content: (
        <div>
          <div className='flex justify-end'>
            <Button className='p-2 capitalize text-[12px] flex items-center gap-1' color='blue'
              onClick={()=>handleDependentAdd(empID)}
            >
              <BsPlus />
              Add Dependents
            </Button>
          </div>
          <div>
            <table className="w-full min-w-max table-auto text-start">
                <thead>
                  <tr>
                    {DepandantsHeader.map((head) => (
                      <th
                        key={head}
                        className="py-4 text-left"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="leading-none font-semibold"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {depandantsData?.map((ele, i)=>(
                    <tr key={i}>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.name}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.gender}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.relationship}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.dob}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.contact} 
                        </Typography>
                      </td>
                    
                      <td className='py-2'>
                        <div className='flex  items-center gap-2'>
                          <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                            onClick={()=>getSingleDependents(ele.id, empID)}

                          ><CiEdit /></span>
                          <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                            onClick={()=>deleteDependent(ele.id, empID )}
                          ><BsTrash2 /></span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "License",
      content: (
        <div>
          <div className='flex items-center gap-5 justify-end'>
            <Button className='p-2 capitalize text-[12px] flex items-center gap-1' color='blue'
              onClick={()=>handleLicenseTypeAdd(empID)}
            >
              <BsPlus />
              Add License Type
            </Button>
            <Button className='p-2 capitalize text-[12px] flex items-center gap-1' color='blue'
              onClick={()=>handleLicenseAdd(empID)}
            >
              <BsPlus />
              Add License
            </Button>
          </div>
          <div>
            <table className="w-full min-w-max table-auto text-start">
                <thead>
                  <tr>
                    {LicensesHeader.map((head) => (
                      <th
                        key={head}
                        className="py-4 text-left"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="leading-none font-semibold"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {licensesData?.map((ele, i)=>(
                    <tr key={i}>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.lic_type}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.license_title}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.license_number}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.issuing_authority}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.issue_date}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.expiry_date} 
                        </Typography>
                      </td>
                    
                      <td className='py-2'>
                        <div className='flex  items-center gap-2'>
                          {licenseValue.loading ? 
                          <Button loading={licenseValue.loading}  value={''} className='p-1'></Button>
                        :
                          <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                          onClick={()=>getSingleLicense(ele.id, empID)}
                          ><CiEdit /></span>
                        }
                          <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                            onClick={()=>deleteLicense(ele.id, empID )}
                          ><BsTrash2 /></span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: "References",
      content: (
        <div>
          <div className='flex justify-end'>
            <Button className='p-2 capitalize text-[12px] flex items-center gap-1' color='blue'
              onClick={()=>handleReferenceAdd(empID)}
            >
              <BsPlus />
              Add Reference
            </Button>
          </div>
          <div>
            <table className="w-full min-w-max table-auto text-start">
                <thead>
                  <tr>
                    {RefrencesHeader.map((head) => (
                      <th
                        key={head}
                        className="py-4 text-left"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="leading-none font-semibold"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {refrencesData?.map((ele, i)=>(
                    <tr key={i}>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.name}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.ref_type == 0 ? 'External' : 'Internal'}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.relation}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.contact}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.address}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div> 
        </div>
      ),
    },
    {
      id: 6,
      title: "Documents",
      content: (
        <div>
          <div className='flex items-center gap-5 justify-end'>
            <Button className='p-2 capitalize text-[12px] flex items-center gap-1' color='blue'
              onClick={()=>handleDocumentAdd(empID)}
            >
              <BsPlus />
              Add Document
            </Button>
          </div>
          <div>
            <table className="w-full min-w-max table-auto text-start">
                <thead>
                  <tr>
                    {DocumentsHeader.map((head) => (
                      <th
                        key={head}
                        className="py-4 text-left"
                      >
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="leading-none font-semibold"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documentsData?.map((ele, i)=>(
                    <tr key={i}>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          <div>
                            <span className='bg-red-400 text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                              onClick={()=>deleteDoument(ele.id, empID )}
                            ><BsTrash2 /></span>
                          </div>
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {ele?.doc_title}
                        </Typography>
                      </td>
                      <td className='py-2'>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          <div className='flex  items-center gap-2'>
                            <span className='bg-[#3DA5F4] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'
                              onClick={()=>handleDocumentView(ele)}
                            ><BsEyeFill /></span>
                            {/* <span className='bg-[#0acf97] text-white rounded-md w-6 h-6 flex items-center justify-center cursor-pointer'><BsDownload /></span> */}
                          </div>
                        </Typography>
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
            </table>
          </div> 
        </div>
      ),
    },
  ]

  const dialogTitle = academicsValue.show ? (academicsValue.addState ? 'Add Academic' : 'Update Academic') :
    experienceValue.show ?
    (experienceValue.addState ? 'Add Experience' : 'Update Experience' )
    :
    dependentsValue.show ?
    (dependentsValue.addState ? 'Add Dependents' : 'Update Dependents' )
    :
    licenseValue.show ?
    (licenseValue.addType ? 'Add License Type' : licenseValue.addState ? 'Add License' : 'Update License')
    :
    referenceValue.show ? 'Add Reference' 
    :
    documentValue.show ? 'Add Document' 
    :
  null



  const DialognContent = academicsValue.show ? (
    <AddEditEducation 
      academicsValue= {academicsValue}
      handleSelectAcademic = {handleSelectAcademic}
      handleAcademicInputChange = {handleAcademicInputChange}
      handleSubmitAcademics = {handleSubmitAcademics}
      

    />
    ) :
    experienceValue.show ? (
      <AddEditExperience 
        experienceValue = {experienceValue}
        handleExpeirenceInputChange = {handleExpeirenceInputChange}
        handleSubmitExperience = {handleSubmitExperience}

      />
    )
  :
  dependentsValue.show?(
    <AddEditDependents 
      dependentsValue = {dependentsValue}
      handleDependentsInputChange = {handleDependentsInputChange}
      handleSubmitDependents = {handleSubmitDependents}
    />

  )
  :
  licenseValue.show?(
    <LicenseTypeEditAdd
      licenseValue= {licenseValue}
      handleSubmitLicense= {handleSubmitLicense}
      handleLicenseInputChange= {handleLicenseInputChange}
      handleSelectLicense= {handleSelectLicense}
      handleSubmitLicenseType= {handleSubmitLicenseType}
    />

  )
  :
  referenceValue.show?(
    <AddReference
      referenceValue= {referenceValue}
      handleSelectReference= {handleSelectReference}
      handleReferenceInputChange= {handleReferenceInputChange}
      handleSubmitReference= {handleSubmitReference}
    />

  )
  :
  documentValue.show?(
    <AddDocument
      documentValue = {documentValue}
      handleDocumentInputChange ={handleDocumentInputChange}
      handleDocumentFileChange ={handleDocumentFileChange}
      handleSubmitDocument ={handleSubmitDocument}
    />

  )
  :
  null


  return (
    <>
    <div className='space-y-4'>
      <div>
        <span className='text-[#3DA5F4]'>{data.empView.section.title}</span>
      </div>
      <div className='space-y-3 border-t border-gray-500 py-2'>
        {accordionData.map(({ id, title, content }) => (
          <Accordion key={id} open={open === id} icon={<Icon id={id} open={open} />}>
            <AccordionHeader onClick={() => handleOpen(id)} className='text-[15px]'>{title}</AccordionHeader>
            <AccordionBody>{content}</AccordionBody>
          </Accordion>
        ))}
      </div>
    </div>

    <CustomDialog 
      openDialog = {academicsValue.show || experienceValue.show || dependentsValue.show || licenseValue.show || referenceValue.show || documentValue.show}
      handleOpen = {
        academicsValue.show ? handleAccedemicAddClose : 
        experienceValue.show ? handleExperienceAddClose :
        dependentsValue.show ? handleDepedentsAddClose :
        licenseValue.show ? handleLicenseAddClose :
        referenceValue.show ? handleReferenceAddClose :
        documentValue.show ? handleDocumentAddClose :
        null
      }
      outsidePress = {false}
      title={dialogTitle}
      compo={
        DialognContent
      }
      footer={false}
      size="lg"
    />


    <ConfirmationDialog 
      openDialog= {deleteAcademicValue.show ? deleteAcademicValue.show : 
        deleteExperienceValue.show ? deleteExperienceValue.show : 
        deleteDependentValue.show ? deleteDependentValue.show : 
        deleteLicenseValue.show ? deleteLicenseValue.show : 
        deleteDocumentValue.show ? deleteDocumentValue.show : 
        null 
      }
      title = 'Delete Confirmation'
      message = {`Are you sure you want to Delete this ${deleteAcademicValue.show ? 'Academic' :  
        deleteExperienceValue.show ? 'Experience' : 
        deleteDependentValue.show ? 'Dependent' : 
        deleteLicenseValue.show ? 'License' : 
        deleteDocumentValue.show ? 'Document' : 
        null 
      } ?`}
      handleConfirm = {deleteAcademicValue.show ?  confirmDeleteAcademic :
         deleteExperienceValue.show?  confirmDeleteExperience :  
         deleteDependentValue.show?  confirmDeleteDependent : 
         deleteLicenseValue.show?  confirmDeleteLicense :
         deleteDocumentValue.show?  confirmDeleteDocument :
        null
      }
      handleOpen = {deleteAcademicValue.show ?  toggleDeleteAcademic : 
        deleteExperienceValue.show? toggleDeleteExpirence  : 
        deleteDependentValue.show? toggleDeleteDependent  :  
        deleteLicenseValue.show? toggleDeleteLicense  :
        deleteDocumentValue.show? toggleDeleteDocument  :
        null 
      }
      loading = {deleteAcademicValue.show ? deleteAcademicValue.loading : 
        deleteExperienceValue.show ? deleteExperienceValue.loading : 
        deleteDependentValue.show ? deleteDependentValue.loading : 
        deleteLicenseValue.show ? deleteLicenseValue.loading :
        deleteDocumentValue.show ? deleteDocumentValue.loading :
        null 
      }

    />
    </>
  )
}

export default EmployeeDocuments