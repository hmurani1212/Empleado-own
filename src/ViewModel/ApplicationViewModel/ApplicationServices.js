import useStore from "../../Store/store"
// import useApplication from '../../ViewModel/ApplicationViewModel/ApplicationServices';
const useApplication = () => {

    const applicationsList = useStore((state) => state.applicationsList)
    const applicationsTableLoading = useStore((state) => state.applicationsTableLoading)
    const applicationsMount = useStore((state) => state.applicationsMount);
    const gettingApplicationsList = useStore((state) => state.gettingApplicationsList);
    const gettingFilteredApplicationsList = useStore((state) => state.gettingFilteredApplicationsList);
    // const gettingApplicationsList = useStore((state)=> state.gettingApplicationsList)
    const handleApplicationsMount = useStore((state) => state.handleApplicationsMount);
    const GetSubmitted_AppFn = useStore((state) => state.GetSubmitted_AppFn)
    const GetSubmitted_AppLi = useStore((state) => state.GetSubmitted_AppLi);
    const SubmitApplcationsFn = useStore((state) => state.SubmitApplcationsFn)
    const uploadFileToElephant = useStore((state) => state.uploadFileToElephant)
    /// const Call_api = useStore((state) => state.Call_api)


    // console.log("GetSubmitted_AppLi", GetSubmitted_AppLi)

    const appTitles = [
        { id: 1, title: 'Applications List', link: '/application/application_list' },
        { id: 2, title: 'New Application', link: '/application/new_applications' }
    ]





    return {
        appTitles, applicationsList, applicationsTableLoading, applicationsMount, handleApplicationsMount, gettingApplicationsList, gettingFilteredApplicationsList, GetSubmitted_AppLi,
        GetSubmitted_AppFn, SubmitApplcationsFn, uploadFileToElephant
    }
}





export default useApplication