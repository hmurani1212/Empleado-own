import { useState } from "react"
import { gettingBranchesFrequentHit, gettingDepartmentsServices, gettingEmployesAllServices, gettingEmployesServices } from "../../services/__frequentApiServices"
import employeesApi from "../../Model/Data/Employees/Employees"
import { arrayMove } from '@dnd-kit/sortable';

const useDefineApprovalFlow = () => {


    const [defineApprovalFlowValue, setDefineApprovalFlowValue] = useState({
        show: false,
        approved_type: null,
        approved_by: null,
        name: '',

        approvalSatges: [
            { id: 1, empId: null, empList: [], departmentId: null, departmentList: [], branchId: null, branchList: [], desginationList: [], desginationId: null, indexs: '1', levelUpto: '5' },
        ]

    })


    const defineApprovalFlowForm = async () => {
        try {
            // Use the existing branch API endpoint
            const response = await employeesApi.gettingAllBranches()
            // console.log('Branch API response:', response)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                const dbData = responseData.DB_DATA.branches
                // Ensure dbData is an array
                const branchList = Array.isArray(dbData) ? dbData : []
                console.log('Branch list:', branchList)

                const transformedBranchList = branchList.map(branch => ({ value: branch.id, label: branch.branch_name }))
                console.log('Transformed branch list:', transformedBranchList)

                setDefineApprovalFlowValue((prevState) => ({
                    ...prevState,
                    approvalSatges: prevState.approvalSatges.map((stage) => ({
                        ...stage,
                        branchList: transformedBranchList
                    })),
                    show: true,
                }));
            } else {
                console.error('Branch API failed:', responseData)
                // If API fails, still show the form with empty branch list
                setDefineApprovalFlowValue((prevState) => ({
                    ...prevState,
                    show: true,
                }));
            }
        } catch (error) {
            console.error('Error fetching branches:', error)
            // If API fails, still show the form with empty branch list
            setDefineApprovalFlowValue((prevState) => ({
                ...prevState,
                show: true,
            }));
        }
    }


    const toggleDefApprovalFlow = () => {
        setDefineApprovalFlowValue((prevState) => ({
            ...prevState,
            show: false
        }))
    }


    const handleSelectDefAppFlow = async (select, field, index) => {
        setDefineApprovalFlowValue((prevState) => ({
            ...prevState,
            [field]: select
        }))
        if (field === 'approved_by') {
            setDefineApprovalFlowValue((prevState) => ({
                ...prevState,
                approvalSatges: prevState.approvalSatges.map((stage) => ({
                    ...stage,
                    branchId: null,
                    empId: null,
                    desginationId: null,
                    departmentId: null,
                    indexs: '1', // Default approval index to 1 when approved_by changes
                })),
                // [field]: select
            }))
            if (select.value === 3) {
                setDefineApprovalFlowValue((prevState) => ({
                    ...prevState,
                    approved_type: { value: 1, label: 'Sequential' }
                }))
            }
        }
        if (field === 'approved_type') {
            // Set default approval index to 1 when approval type changes to Sequential
            setDefineApprovalFlowValue((prevState) => ({
                ...prevState,
                approvalSatges: prevState.approvalSatges.map((stage) => ({
                    ...stage,
                    indexs: select.value === 1 ? '1' : stage.indexs, // Set to 1 if Sequential, keep existing otherwise
                })),
            }))
        }
        if (field === 'branchId') {
            try {
                // Use the correct department API endpoint
                const response = await employeesApi.gettingSubDepts({ branch_id: select.value })
                // console.log('Department API response:', response)
                const responseData = response.data;
                // console.log('what is the response from here', responseData);

                if (responseData.STATUS === "SUCCESSFUL") {
                    const dbData = responseData?.DB_DATA?.departments;
                    // console.log('what is the result', dbData)
                    const departmentList = Array.isArray(dbData) ? dbData : []
                    // console.log('Department list:', departmentList)

                    setDefineApprovalFlowValue((prevState) => ({
                        ...prevState,
                        approvalSatges: prevState.approvalSatges.map((stage, i) =>
                            i === index ? {
                                ...stage,
                                branchId: select,
                                departmentId: null,
                                desginationId: null,
                                empId: null,
                                departmentList: [{ value: 0, label: 'All' }, ...departmentList.map(dept => ({ value: dept.id, label: dept.name }))]
                            } : stage,
                        ),
                    }));
                } else {
                    console.error('Department API failed:', responseData)
                    // Set empty department list on API failure
                    setDefineApprovalFlowValue((prevState) => ({
                        ...prevState,
                        approvalSatges: prevState.approvalSatges.map((stage, i) =>
                            i === index ? {
                                ...stage,
                                branchId: select,
                                departmentId: null,
                                desginationId: null,
                                empId: null,
                                departmentList: [{ value: 0, label: 'All' }]
                            } : stage,
                        ),
                    }));
                }
            } catch (error) {
                console.error('Error fetching departments:', error)
                // Set empty department list on error
                setDefineApprovalFlowValue((prevState) => ({
                    ...prevState,
                    approvalSatges: prevState.approvalSatges.map((stage, i) =>
                        i === index ? {
                            ...stage,
                            branchId: select,
                            departmentId: null,
                            desginationId: null,
                            empId: null,
                            departmentList: [{ value: 0, label: 'All' }]
                        } : stage,
                    ),
                }));
            }
        }
        if (field === 'departmentId') {
            if (defineApprovalFlowValue?.approved_by?.value === 1) {
                try {
                    // Use the correct designation API endpoint
                    const response = await employeesApi.getDesignations({ d_id: select.value })
                    // console.log('Designation API response:', response)
                    const responseData = response.data

                    if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                        const dbData = responseData.DB_DATA.designations
                        const designationList = Array.isArray(dbData) ? dbData : []
                        console.log('Designation list:', designationList)

                        const transformedDesignationList = [{ value: 0, label: 'All' }, ...designationList.map(desg => ({ value: desg.id, label: desg.title }))]
                        // console.log('Transformed designation list:', transformedDesignationList)

                        setDefineApprovalFlowValue((prevState) => ({
                            ...prevState,
                            approvalSatges: prevState.approvalSatges.map((stage, i) =>
                                i === index ? {
                                    ...stage,
                                    departmentId: select,
                                    desginationId: null,
                                    empId: null,
                                    desginationList: transformedDesignationList
                                } : stage,
                            ),
                        }));
                    } else {
                        // console.error('Designation API failed:', responseData)
                        // Set empty designation list on API failure
                        setDefineApprovalFlowValue((prevState) => ({
                            ...prevState,
                            approvalSatges: prevState.approvalSatges.map((stage, i) =>
                                i === index ? {
                                    ...stage,
                                    departmentId: select,
                                    desginationId: null,
                                    empId: null,
                                    desginationList: [{ value: 0, label: 'All' }]
                                } : stage,
                            ),
                        }));
                    }
                } catch (error) {
                    console.error('Error fetching designations:', error)
                    // Set empty designation list on error
                    setDefineApprovalFlowValue((prevState) => ({
                        ...prevState,
                        approvalSatges: prevState.approvalSatges.map((stage, i) =>
                            i === index ? {
                                ...stage,
                                departmentId: select,
                                desginationId: null,
                                empId: null,
                                desginationList: [{ value: 0, label: 'All' }]
                            } : stage,
                        ),
                    }));
                }
            }
            if (defineApprovalFlowValue?.approved_by?.value === 2) {
                const empData = await employeesApi.get_all_employeee(select.value);
                const employeeList = empData?.data?.DB_DATA
                console.log('this is last test', employeeList)

                setDefineApprovalFlowValue((prevState) => ({
                    ...prevState,
                    approvalSatges: prevState.approvalSatges.map((stage, i) =>
                        i === index ? { 
                            ...stage, 
                            departmentId: select, 
                            desginationId: null, 
                            empId: null, 
                            empList: [
                                { value: 0, label: 'All', empData: null }, 
                                ...employeeList.map(emp => ({ 
                                    value: emp.id, 
                                    label: emp.name,
                                    empData: emp // Store full employee object to access department_id and branch_id
                                }))
                            ] 
                        } : stage,

                    ),
                }));
            }
        }
        if (field === 'desginationId') {
            setDefineApprovalFlowValue((prevState) => ({
                ...prevState,
                approvalSatges: prevState.approvalSatges.map((stage, i) =>
                    i === index ? { ...stage, desginationId: select } : stage,

                ),
            }));
        }
        if (field === 'empId') {
            setDefineApprovalFlowValue((prevState) => ({
                ...prevState,
                approvalSatges: prevState.approvalSatges.map((stage, i) =>
                    i === index ? { ...stage, empId: select } : stage,

                ),
            }));
        }

    }


    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) {
            return;
        }
        if (active.id !== over.id) {
            const oldIndex = defineApprovalFlowValue.approvalSatges.findIndex((item) => item.id === active.id);
            const newIndex = defineApprovalFlowValue.approvalSatges.findIndex((item) => item.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const reorderedStages = arrayMove(defineApprovalFlowValue.approvalSatges, oldIndex, newIndex);

                setDefineApprovalFlowValue((prev) => ({
                    ...prev,
                    approvalSatges: reorderedStages,
                }));
            }
        }
    };

    const handleChangeApprovalFlow = (e) => {
        const { name, value } = e.target
        setDefineApprovalFlowValue((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }





    const handleAddMoreAccordian = () => {
        // console.log('tatta', defineApprovalFlowValue.approvalSatges)
        // console.log('*********')
        setDefineApprovalFlowValue((prevState) => ({
            ...prevState,
            approvalSatges: [
                ...prevState.approvalSatges,
                {
                    id: prevState.approvalSatges.length + 1,  // Dynamically assign a unique id
                    empId: null,
                    empList: [],
                    departmentId: null,
                    departmentList: [],
                    branchId: null,
                    branchList: prevState.approvalSatges[0]?.branchList || [],
                    desginationList: [],
                    desginationId: null,
                    indexs: '1', // Default approval index to 1
                    levelUpto: '5',
                },
            ],
        }));
    }


    const removeApprovalStage = (id) => {
        setDefineApprovalFlowValue((prevState) => ({
            ...prevState,
            approvalSatges: prevState.approvalSatges.filter((ele) => ele.id !== id)
        }));
    }



    return {
        defineApprovalFlowValue,
        setDefineApprovalFlowValue,
        defineApprovalFlowForm,
        toggleDefApprovalFlow,
        handleSelectDefAppFlow,
        handleDragEnd,
        handleChangeApprovalFlow,
        handleAddMoreAccordian,
        removeApprovalStage
    }


}


export default useDefineApprovalFlow