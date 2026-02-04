import { useState , useEffect} from "react"
import noticesApi from "../../Model/Data/Notices/Notices"
import { showToast } from "../../Components/Toaster/Toaster"

const useEditNoticeService = ()=>{

     const getForNoticeEdit =  async(notice) => {

        const data = {id: notice.id}
        const response = await noticesApi.singleNotice(data)
        const resData = response.data 
        if(response.status === 200 && resData.STATUS === "SUCCESSFUL"){
            setAddNoticeValue((prevState)=>({
                ...prevState,
                title: resData.DB_DATA.title,
                notice: resData.DB_DATA.description,
                
            }))
            // openDrawer()
            // settingDrawerSize(500)
            // settingDrawerTitle('Edit Notice')
            // settingComponent(<EditNoticeForm 
            //     // addNoticeValue= {addNoticeValue}
            //     handleEditNotice= {handleEditNotice}
            //     handleAddNoticeBranch= {handleAddNoticeBranch}
            
            // />)
        }

        // setAddNoticeValue ({
        //     // branch_name:notice.branch_id, 
        //     // department:notice.deptt_id,
        //     title: notice.title,
        //     notice: notice.description,
        // });
        
    }
   const [addNoticeValue, setAddNoticeValue] = useState({
        id:'',
        branch_id: '',
        deptt_id: '',
        title : '',
        notice: ''

    })

    const [showNoticeDrawer, setShowNoticeDrawer] = useState(false)


    const  closeNoticeDrawer = () => {
        setShowNoticeDrawer(false)
    }

    const handleEditNotice = async (e) => {
        e.preventDefault();

        const editNoticeData = {
            id :addNoticeValue.id, 
            branch_name:addNoticeValue.branch_id, 
            department:addNoticeValue.deptt_id,
            title: addNoticeValue.title,
            notice: addNoticeValue.notice,
        }

        try {
            const response = await noticesApi.editNotice(editNoticeData);
            const respEditData = await response.data;

            if (response.status === 200 && respEditData.STATUS === 'SUCCESSFUL') {
                // updateBranch(respEditData.UPDATED_DATA)
                showToast(`${respEditData.DESCRIPTION}`, 'success');
                setShowNoticeDrawer(false)
            } else {
                showToast(`${respEditData.ERROR_DESCRIPTION}`, 'error');
                
            }

            

        }catch(err) {
            console.log(err)
        }
    }
    

    return {showNoticeDrawer, setShowNoticeDrawer, getForNoticeEdit, closeNoticeDrawer, handleEditNotice,addNoticeValue }
}

export default useEditNoticeService