import { useState } from "react";
import useStore from "../../Store/store";
import { showToast } from "../../Components/Toaster/Toaster";
import hrPoliciesApi from "../../Model/Data/HRPolicies/HRPolicies";
import { useNavigate } from "react-router";

const useSwapPolciyServices = () => {
    const allPolicies = useStore((state) => state.allPolicies)
    const [swapPolicyState, setSwapPolicyState] = useState(1);


    const [swapPolicyValue, setSwapPolicyValue] = useState({
        currentPolicy: null,
        swapPolicy: null,
        effectiveFromDate: '',
        effectiveFromTime: '',
        rollBackDate: '',
        rollBackTime: '',
        checkBox: '',
        days: '',
        loading: false,
        currentPolicyArray: [],
    })



    const navigate = useNavigate()


    const handleSwapPolicyState = (e) => {
        setSwapPolicyState(Number(e.target.value))
    }

    const handleSelectChange = (selectedOption, field) => {
        setSwapPolicyValue((prevState) => ({
            ...prevState,
            [field]: selectedOption
        }))
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSwapPolicyValue((prevState) => ({
            ...prevState,
            [name]: value
        }))

    }

    const handleCheckbox = (e) => {
        const { name, checked } = e.target;
        setSwapPolicyValue((prevState) => ({
            ...prevState,
            [name]: checked ? 1 : 0,
            days: ''
        }));
    }

    const validateOneToOnePolicy = () => {
        if (!swapPolicyValue.currentPolicy) {
            showToast('Select Current Policy', 'error')
            return
        }
        if (!swapPolicyValue.swapPolicy) {
            showToast('Select Policy For Swap', 'error')
            return
        }
        // Removed days validation as Recursive After is optional
        // if (swapPolicyValue.checkBox === 1) {
        //     if (swapPolicyValue.days === '') {
        //         showToast('Days can not be empty', 'error')
        //         return
        //     }
        // }

        return true
    }

    const handleOneToOnePolicy = async (e) => {
        e.preventDefault()
        const validate = validateOneToOnePolicy()
        if (validate) {
            const data = {
                current_policy: swapPolicyValue.currentPolicy.value,
                new_policy: swapPolicyValue.swapPolicy.value,
                effective_date: swapPolicyValue.effectiveFromDate,
                effective_time: swapPolicyValue.effectiveFromTime
                    ? `${swapPolicyValue.effectiveFromTime}${swapPolicyValue.effectiveFromTime.split(':').length === 2 ? ':00' : ''}`
                    : '',

                rollback_date: `${swapPolicyValue.rollBackDate}`,
                rollback_time: swapPolicyValue.rollBackTime
                    ? `${swapPolicyValue.rollBackTime}${swapPolicyValue.rollBackTime.split(':').length === 2 ? ':00' : ''}`
                    : '',

                recursive_after_days: swapPolicyValue.days,
                swap_type: "one_to_one",
            }
            console.log(swapPolicyValue)
            setSwapPolicyValue((prevState) => ({
                ...prevState,
                loading: true,
                days: ''
            }));
            try {
                const response = await hrPoliciesApi.swapPolicy(data)
                console.log('response', response)
                const responseData = response.data
                if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                    showToast('Policy Swap Successfully', 'success')
                    navigate('/hrpolicies/manage_policies')
                } else {
                    showToast(responseData.ERROR_DESCRIPTION, 'error')
                }
            } catch (err) {
                showToast(err?.response?.data?.ERROR_DESCRIPTION || 'Sorry we are unable to process your request', 'error')
            } finally {
                setSwapPolicyValue((prevState) => ({
                    ...prevState,
                    loading: false,
                    days: ''
                }));
            }
        }
    }


    const handleSelectMutiplePolicy = (policy, index) => {
        setSwapPolicyValue((prevState) => {
            const currentPolicyArray = [...prevState.currentPolicyArray];
            const policyIndex = currentPolicyArray.findIndex((p) => p.id === policy.id);

            if (policyIndex !== -1) {
                currentPolicyArray.splice(policyIndex, 1); // Remove policy if already selected
            } else {
                currentPolicyArray.push(policy); // Add policy if not selected
            }

            return { ...prevState, currentPolicyArray };
        });
    }


    const validateManyToOnePolicy = () => {
        if (swapPolicyValue.currentPolicyArray.length < 1) {
            showToast('At least Select One Current Policy', 'error')
            return
        }
        if (!swapPolicyValue.swapPolicy) {
            showToast('Select Policy For Swap', 'error')
            return
        }
        // Removed days validation as Recursive After is optional
        // if (swapPolicyValue.checkBox === 1) {
        //     if (swapPolicyValue.days === '') {
        //         showToast('Days can not be empty', 'error')
        //         return
        //     }
        // }

        return true
    }

    const handleManyToOnePolicy = async (e) => {
        e.preventDefault()

        const validate = validateManyToOnePolicy()
        if (validate) {
            const data = {
                current_policy: swapPolicyValue.currentPolicyArray?.map((ele) => ele.id),
                new_policy: swapPolicyValue.swapPolicy.value,
                effective_date: swapPolicyValue.effectiveFromDate,
                eeffective_time: swapPolicyValue.effectiveFromTime
                    ? `${swapPolicyValue.effectiveFromTime}${swapPolicyValue.effectiveFromTime.split(':').length === 2 ? ':00' : ''}`
                    : '',
                rollback_date: `${swapPolicyValue.rollBackDate}`,
                rollback_time: swapPolicyValue.rollBackTime
                    ? `${swapPolicyValue.rollBackTime}${swapPolicyValue.rollBackTime.split(':').length === 2 ? ':00' : ''}`
                    : '',
                recursive_after_days: swapPolicyValue.days,
                policy_swaping_type: "many_to_one",


            }
            ///console.log('data', data)
            console.log(swapPolicyValue)
            setSwapPolicyValue((prevState) => ({
                ...prevState,
                loading: true,
                days: ''
            }));
            try {
                const response = await hrPoliciesApi.swapPolicy(data)
                console.log('response', response)
                const responseData = response.data
                if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                    showToast('Policy Swap Successfully', 'success')
                    navigate('/hrpolicies/manage_policies')
                } else {
                    showToast(responseData.ERROR_DESCRIPTION, 'error')
                }
            } catch (err) {
                showToast(err?.data?.response.ERROR_DESCRIPTION, 'error')
            }

            finally {
                //showToast('Policy already been Schedule', 'error')
                setSwapPolicyValue((prevState) => ({
                    ...prevState,
                    loading: false,
                    days: ''
                }));
            }
        }


    }

    return {
        handleSwapPolicyState, swapPolicyState, allPolicies, handleSelectChange, swapPolicyValue,
        handleChange, handleCheckbox, handleOneToOnePolicy,
        handleManyToOnePolicy, handleSelectMutiplePolicy

    }
}

export default useSwapPolciyServices;