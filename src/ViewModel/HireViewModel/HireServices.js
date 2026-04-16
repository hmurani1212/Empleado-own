import useStore from "../../Store/store"
import applicantslogo from '../../assets/images/applicants.png'
import interviewedlogo from '../../assets/images/interviewed.png'
import shortlistlogo from '../../assets/images/shortlisted.png'
import acceptlogo from '../../assets/images/accepted.png'
import rejectlogo from '../../assets/images/rejected.png'
import talentlogo from '../../assets/images/talent-pool.png'
import { useState, useEffect } from "react"
import { FaInstagram, FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router"
import hireApi from "../../Model/Data/Hire/Hire"
import { showToast } from "../../Components/Toaster/Toaster"
import { validateShortlistForm } from "../../Validation/Validation"
import ActivateVacancyForm from "../../View/Hire/ActivateVacancyForm";
import useHire_2 from "../HireViewModel2/hireServices_2"
import { format } from "date-fns"
import useEmployees from "../EmployeeViewModel/EmployeeServices"
import { Input } from "@material-tailwind/react"
import CustomSelect from "../../Components/CustomSelect/CustomSelect"
import Calendar from "react-calendar"
const useHire = () => {
  const gettingAllVacanciesList = useStore((state) => state.gettingAllVacanciesList)
  const mountHireList = useStore((state) => state.mountHireList)
  const allVacanciesList = useStore((state) => state.allVacanciesList)
  const hireVacanciesSearch = useStore((state) => state.hireVacanciesSearch)
  const City_data = useStore((state) => state.City_data)
  const gettingCitiesByCountry = useStore((state) => state.gettingCitiesByCountry)

  // Get fetchingAllBranches from useEmployees hook
  const { fetchingAllBranches } = useEmployees()
  // const gettingDashboardRecuirment = useStore((state) => state.gettingDashboardRecuirment)
  // const gettingAllPendingApp = useStore((state) => state.gettingAllPendingApp)
  // const gettingAllCount = useStore((state) => state.gettingAllCount)
  const allPendingApp = useStore((state) => state.allPendingApp)
  ///const gettingAllShortlistedApp = useStore((state) => state.gettingAllShortlistedApp)
  const allShortlistedApp = useStore((state) => state.allShortlistedApp)
  const gettingAllInterviewApp = useStore((state) => state.gettingAllInterviewApp)
  const allInterviewApp = useStore((state) => state.allInterviewApp)
  const allAcceptApp = useStore((state) => state.allAcceptApp)
  ///const gettingAcceptedApp = useStore((state) => state.gettingAcceptedApp)
  const allRejectApp = useStore((state) => state.allRejectApp)
  const gettingRejectedApp = useStore((state) => state.gettingRejectedApp)
  const viewPending = useStore((state) => state.viewPending)
  const gettingViewPending = useStore((state) => state.gettingViewPending)
  const gettingRounds = useStore((state) => state.gettingRounds)
  const allRounds = useStore((state) => state.allRounds)
  const gettingStarredApp = useStore((state) => state.gettingStarredApp)
  const allStarredApp = useStore((state) => state.allStarredApp)
  const addShortlist = useStore((state) => state.addShortlist)
  const addtoReject = useStore((state) => state.addtoReject)
  const appUnshortlist = useStore((state) => state.appUnshortlist)
  const gettingTalentPoolData = useStore((state) => state.gettingTalentPoolData)
  const deactivcatingVacancy = useStore((state) => state.deactivcatingVacancy)
  const activcatingVacancy = useStore((state) => state.activcatingVacancy)
  const openDrawer = useStore((state) => state.openDrawer)
  const closeDrawer = useStore((state) => state.closeDrawer)
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
  const settingComponent = useStore((state) => state.settingComponent)
  const settingDrawerSize = useStore((state) => state.settingDrawerSize)
  const addToStarred = useStore((state) => state.addToStarred)
  const gettingVacancyRounds = useStore((state) => state.gettingVacancyRounds)
  const vacRounds = useStore((state) => state.vacRounds);
  const get_record = useStore((state) => state.get_count_app);
  const record_data = useStore((state) => state.get_count_app_data);
  const get_rejected_app = useStore((state) => state.get_rejected_app);
  const get_rejected_app_data = useStore((state) => state.get_rejected_app_data);
  const rejectedPaginationData = useStore((state) => state.rejectedPaginationData);
  const getViewDataPending = useStore((state) => state.gettingViewPending);
  const get_applicants_data = useStore((state) => state.allApplicants_data);
  const removeApplicantFromList = useStore((state) => state.removeApplicantFromList);
  const get_allApplicants = useStore((state) => state.gettingAllApplicants);
  const Re_Interviewfn = useStore((state) => state.Re_Interviewfn);
  const Re_Interview_data = useStore((state) => state.Re_Interviewfn);

 


  const { } = useHire_2();



  // console.log('type of vaccancy list ', typeof gettingAllVacanciesList)

  const { vacancyId } = useParams()

  const navigate = useNavigate()

  // Function to refresh data after status changes
  const refreshDataAfterStatusChange = async (currentStatus = null, currentLocation = null) => {
    try {
      // Refresh the count API to update menu counts
      await get_record();

      // Refresh the current view data
      if (currentStatus && currentLocation) {
        await get_allApplicants(vacancyId, { status: currentStatus }, currentStatus, currentLocation);
      }

      console.log('Data refreshed after status change');
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const hireMenu = [
    { id: 1, title: 'Vacancies List', link: '/hire/vacancies_list' },
    { id: 2, title: 'Talent Pool', link: '/hire/talent_pool' }
  ];


  // console.log('this is record list', record_data)

  const hireCardList = [
    { id: 1, title: 'Applicants', imgSrc: applicantslogo, legendBg: '#7571F9', count: record_data.total_applications, link: `/hire/vacancies_list/all_applicants/${0}/applicant` },
    { id: 2, title: 'Shortlisted', imgSrc: shortlistlogo, legendBg: '#F8C038', count: record_data.total_shortlisted, link: `/hire/vacancies_list/all_applicants/${0}/shortlisted` },
    { id: 3, title: 'Interviewed', imgSrc: interviewedlogo, legendBg: '#2ABFCC', count: record_data.total_interviewed, link: `/hire/vacancies_list/all_applicants/${0}/interviewed` },
    { id: 4, title: 'Accepted', imgSrc: acceptlogo, legendBg: '#0ACF97', count: record_data.total_accepted, link: `/hire/vacancies_list/all_applicants/${0}/accepted` },
    { id: 5, title: 'Rejected', imgSrc: rejectlogo, legendBg: '#FF5E5E', count: record_data.total_rejected, link: `/hire/vacancies_list/all_applicants/${0}/rejected` },
    { id: 6, title: 'Talent Pool', imgSrc: talentlogo, legendBg: '#97CEF8', count: record_data.talent_pool, link: '/hire/talent_pool' },
  ]

  const hireItems = [
    { id: 1, title: 'Delete' },
    { id: 2, title: 'Deactivate' },
    { id: 3, title: 'Activate' }
  ]

  const hireShareItems = [
    { id: 1, icon: <FaFacebookF />, title: 'Facebook' },
    { id: 2, icon: <FaInstagram />, title: 'Instagram' },
    { id: 3, icon: <FaLinkedinIn />, title: 'LinkedIn' },
    { id: 4, icon: <FaXTwitter />, title: 'Twitter' }
  ]

  const actionHireMenu = [
    { id: 1, title: 'Shortlist' },
    { id: 2, title: 'Reject' },
    { id: 3, title: 'View Detail' },
    { id: 4, title: 'Talent Pool' },
  ]

  const actionShortlistMenu = [
    { id: 1, title: 'Unshortlist' },
    { id: 2, title: 'Reject' },
    { id: 3, title: 'Interview Score' },
    { id: 4, title: 'App Detail' },
  ]

  const actionInterviewedMenu = [
    { id: 1, title: 'Accept' },
    { id: 2, title: 'Re-interview' },
    { id: 3, title: 'Reject' },
    { id: 4, title: 'App Detail' },
  ]
  //  console.log('record_data', record_data);
  const allApplicantsMenu =
    [
      { id: 1, title: 'Applicants', allcount: record_data.total_applications ? record_data.total_applications : '0', link: `/hire/vacancies_list/all_applicants/${vacancyId}/applicant` },
      { id: 2, title: 'Starred', allcount: record_data.total_starred ? record_data.total_starred : '0', link: `/hire/vacancies_list/all_applicants/${vacancyId}/starred` },
      { id: 3, title: 'Shortlisted', allcount: record_data.total_shortlisted ? record_data.total_shortlisted : '0', link: `/hire/vacancies_list/all_applicants/${vacancyId}/shortlisted` },
      { id: 4, title: 'Interviewed', allcount: record_data.total_interviewed ? record_data.total_interviewed : '0', link: `/hire/vacancies_list/all_applicants/${vacancyId}/interviewed` },
      { id: 5, title: 'Accepted', allcount: record_data.total_accepted ? record_data.total_accepted : '0', link: `/hire/vacancies_list/all_applicants/${vacancyId}/accepted` },
      { id: 6, title: 'Rejected', allcount: record_data.total_rejected ? record_data.total_rejected : '0', link: `/hire/vacancies_list/all_applicants/${vacancyId}/rejected` },
    ];

  // console.log('record_data record_data', record_data)

  const filterByStatusMenu = [
    { id: 1, title: 'All Vacancies', statusFilter: 2 },
    { id: 2, title: 'Active Vacancies', statusFilter: 1 },
    { id: 3, title: 'Inactive Vacancies', statusFilter: 0 },
  ]

  const genderOptions = [
    { id: 1, title: 'Male', genderId: 1 },
    { id: 2, title: 'Female', genderId: 0 }
  ]



  const [openMenuHire, setOpenMenuHire] = useState({})
  const toggleMenuHire = (index, isOpen) => {
    setOpenMenuHire((prevOpenMenuHire) => ({
      ...prevOpenMenuHire,
      [index]: isOpen
    }))
  }

  const [openMenuShare, setOpenMenuShare] = useState({})
  const toggleMenuShare = (index, isOpenShare) => {
    setOpenMenuShare((prevOpenMenuShare) => ({
      ...prevOpenMenuShare,
      [index]: isOpenShare
    }))

  }

  const handleMenuItemsHire = (id, ele) => {
    switch (id) {
      case 1:
        console.log('Edit')
        break;

      default:
        console.log('I am Default')
    }
  }

  const [vacancySearch, setVacancySearch] = useState([])
  const handleVacancyChange = (e) => {
    const { name, value } = e.target

    setVacancySearch((prevState) => ({
      ...prevState,
      [name]: value
    }))

    hireVacanciesSearch(value)
  }


  const handleAllApps = (vacancyId) => {
    navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/applicant`)
    // gettingAllCount(vacancyId)
    // gettingAllPendingApp(vacancyId)
    console.log('clcik')
  }


  const handleBackVacancies = () => {
    navigate('/hire/vacancies_list')
  }

  const handleNavigateView = (data) => {
    //console.log("handleNavigateView called with data:", data);

    if (data.application_type === 'pending') {
      navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/applicant/view_detail/${data.id}`) // Changed from data.app_id to data.id
    }

    else if (data.application_type === 'starred') {
      navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/starred/view_detail/${data.id}`) // Changed from data.app_id to data.id
    }

    else if (data.application_type === 'shortlisted') {
      navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/shortlisted/view_detail/${data.id}`) // Changed from data.app_id to data.id
    }

    else if (data.application_type === 'interviewed') {
      navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/interviewed/view_detail/${data.id}`) // Changed from data.app_id to data.id
    }

    else if (data.application_type === 'accepted') {
      navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/accepted/view_detail/${data.id}`) // Changed from data.app_id to data.id
    }

    else if (data.application_type === 'rejected') {
      //console.log("Rejected application - hire data:", data?.hire);
      navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/rejected/view_detail/${data?.hire?.app_id}`)
    }
    // else if()

    // console.log("Calling gettingViewPending with vacancyId:", vacancyId, "and data:", data);
    gettingViewPending(vacancyId, data)
  }


  const handleClose = () => {
    navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/applicant`)
  }

  const [openDialogShortlist, setOpenDialogShortlist] = useState(false)
  const [viewAppId, setViewAppId] = useState('')
  const handleActionShortlist = (appId) => {
    setOpenDialogShortlist(!openDialogShortlist)
    setViewAppId(appId)
  }

  const [openDialogReject, setOpenDialogReject] = useState(false)
  const handleActionReject = (appId) => {
    // console.log(appId)
    setOpenDialogReject(!openDialogReject)
    setViewAppId(appId)
  }

  const [openTalentPool, setOpenTalentPool] = useState(false)
  const handleActionTalentPool = (appId) => {
    //console.log(appId)
    setOpenTalentPool(!openTalentPool)
    setViewAppId(appId)
  }

  const hanldeActionsItems = (id, ele) => {
    // console.log('action', ele)
    switch (id) {
      case 1:
        handleActionShortlist(ele.id) // Changed from ele.app_id to ele.id
        gettingRounds(`${ele?.vacancy?.id}`)

        console.log('Shortlist')
        break;

      case 2:
        handleActionReject(ele.id) // Changed from ele.app_id to ele.id
        break;

      case 3:
        navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/applicant/view_detail/${ele.id}`) // Changed from ele.app_id to ele.id
        break;

      case 4:
        handleActionTalentPool(ele.id) // Changed from ele.app_id to ele.id
        break;

      default:
        console.log('Default case')

    }
  }



  const [addShortlistValues, setAddShortlistValues] = useState({
    app_id: '',
    appId: '',
    interviewTime: '',
    comment: '',
    label: '',
    round_id: ''
  })


  const addToShortlist = async (e) => {
    console.log(viewAppId)

    e.preventDefault()

    // Validate shortlist form data
    try {
      await validateShortlistForm.validate(addShortlistValues, { abortEarly: false })
    } catch (error) {
      // Show toast for the first validation error
      const firstError = error.inner[0]
      showToast(firstError.message, 'error')
      return
    }

    // Find the candidate data from the current applicants list
    const currentApplicant = get_applicants_data?.find(app => app.id === viewAppId);

    if (!currentApplicant || !currentApplicant.candidate) {
      showToast('Candidate data not found', 'error');
      return;
    }

    const shortlistData = {
      id: viewAppId, // Pass application ID as 'id' for URL path
      candidate_id: currentApplicant.candidate.id, // Get candidate_id from application data
      label: addShortlistValues.label,
      interviewTime: addShortlistValues.interviewTime,
      comment: addShortlistValues.comment,
      round_id: addShortlistValues.round_id
    };

    try {
      const response = await hireApi.addShortlisting(shortlistData)
      const data = response.data


      if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
        showToast(`Shortlisted Successfully`, 'success')

        // Store the shortlisted applicant data for the template modal
        const shortlistedData = {
          id: viewAppId,
          candidate: currentApplicant.candidate,
          vacancy: currentApplicant.vacancy,
          label: addShortlistValues.label,
          interviewTime: addShortlistValues.interviewTime,
          comment: addShortlistValues.comment,
          round_id: addShortlistValues.round_id
        }

        console.log('Setting shortlisted applicant data for modal:', shortlistedData)
        setShortlistedApplicantData(shortlistedData)

        setAddShortlistValues({
          appId: '',
          interviewTime: '',
          comment: '',
          label: '',
          round_id: ''
        })
        addShortlist(viewAppId)
        setOpenDialogShortlist(false)

        // Refresh data after successful shortlisting
        await refreshDataAfterStatusChange("4", "Applicants");

        // Open the shortlist template modal
        setShortlistTemplateDialog(true)
      } else {
        showToast(`${data.ERROR_DESCRIPTION}`, 'error')
      }
    } catch (error) {
      showToast(error?.response?.data?.ERROR_DESCRIPTION || 'Failed to delete branch', 'error');
    }
  }

  const handleChangeShortlist = (e) => {
    const { name, value } = e.target;


    if (name in addShortlistValues) {
      setAddShortlistValues((prevState) => ({
        ...prevState,
        [name]: value
      }));
    } else if (name in rejectValues) {
      setRejectValues((prevState) => ({
        ...prevState,
        [name]: value
      }));
    } else if (name in scoreInterview) {
      setScoreInterview((prevState) => ({
        ...prevState,
        [name]: value
      }));
    } else if (name in reInterviewData) {
      setReInterviewData((prevState) => ({
        ...prevState,
        [name]: value
      }));
    } else if (name in addTalentPoolValues) {
      setAddTalentPoolValues((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }

  };

  const handleChangeActive = (e) => {
    const { name, value } = e.target.value;
    setDeactiveValues((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };


  const handleChangeRound = (field, value) => {
    if (field in addShortlistValues) {
      setAddShortlistValues((prevState) => ({
        ...prevState,
        [field]: value
      }))
    } else if (field in reInterviewData) {
      setReInterviewData((prevState) => ({
        ...prevState,
        [field]: value
      }))

    }

  }

  const [addTalentPoolValues, setAddTalentPoolValues] = useState({
    appId: '',
    labelTalent: '',
    talent: ''
  })
  const handleAddTalentPool = async (e) => {
    e.preventDefault()

    // Validate form data
    if (!addTalentPoolValues.talent || addTalentPoolValues.talent.trim() === '') {
      showToast('Please enter talent description', 'error');
      return;
    }

    // Find the candidate data from the current applicants list
    const currentApplicant = get_applicants_data?.find(app => app.id === viewAppId);

    if (!currentApplicant || !currentApplicant.candidate) {
      showToast('Candidate data not found', 'error');
      return;
    }

    const talentPoolValues = {
      candidate_id: currentApplicant.candidate.id,
      label: addTalentPoolValues.labelTalent || '',
      talent: addTalentPoolValues.talent
    }



    try {
      const response = await hireApi.addToTalentPool(talentPoolValues)
      const data = response.data


      if (data.STATUS === 'SUCCESSFUL') {
        showToast('Successfully added to talent pool', 'success')
        setAddTalentPoolValues({
          appId: '',
          labelTalent: '',
          talent: ''
        })
        setOpenTalentPool(false)
        // Remove the applicant from the current list after successful addition
        removeApplicantFromList(viewAppId)

        // Refresh data after successful talent pool addition
        await refreshDataAfterStatusChange("4", "Applicants");
      } else {
        showToast(`${data.ERROR_DESCRIPTION}`, 'error')
      }
    } catch (error) {

      showToast(error?.response?.data?.ERROR_DESCRIPTION || 'Failed to Add in talent pool', 'error');
    }

  }

  // <-- Reject -->
  const [rejectValues, setRejectValues] = useState({
    appId: '',
    labelR: '',
    rejectReason: ''
  })


  // Tooba
  // Real Time Rejection Not working
  const handleRejectApp = async (e) => {
    e.preventDefault()

    const rejectData = {
      appId: viewAppId,
      label: rejectValues.labelR,
      rejectReason: rejectValues.rejectReason,
    }

    try {
      const response = await hireApi.rejectApplicant(rejectData)
      const data = response.data



      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        showToast('Applicant Rejected Successfully', 'success')
        setRejectValues({
          appId: '',
          label: '',
          rejectReason: ''
        })
        addtoReject(viewAppId)
        setOpenDialogReject(false)

        // Refresh data after successful rejection
        await refreshDataAfterStatusChange("4", "Applicants");
      } else {
        showToast(`${data.ERROR_DESCRIPTION}`, 'error');
      }
    } catch (error) {

    }
  }

  const handleChangeStar = (field, value) => {
    setStarredData((prevState) => ({
      ...prevState,
      [field]: value
    }))



  }

  const [starred, setStarred] = useState(false)
  const [setStarredData] = useState([])
  const [starredIndexes, setStarredIndexes] = useState([]);



  const handleStarClick = async (data, index) => {
    const isStarred = starredIndexes.includes(index);

    const starData = {
      app_id: data.id, // Changed from data.app_id to data.id
      status: isStarred ? 5 : 4,
    };

    try {

      const response = await hireApi.starApplicant(starData);
      const responseData = response.data;

      if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
        // setStarredIndex(index)
        addToStarred(data.id) // Changed from data.app_id to data.id
        setStarredIndexes(prevIndexes => {
          if (isStarred) {
            return prevIndexes.filter(idx => idx !== index);
          } else {
            return [...prevIndexes, index];
          }
        });

        // Refresh data after successful star/unstar
        await refreshDataAfterStatusChange("4", "Applicants");
      }
    } catch (error) {

    }
  };

  // <-- Unshortlist --> 

  const [setUnshortlist] = useState({})
  const unShortlist = async () => {
    const unshortlistData = { appId: viewAppId, status: 4 }
    try {
      const response = await hireApi.unShortlistApp(unshortlistData)
      const data = response.data


      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        showToast('Applicant Unshortlisted Successfully', 'success')
        setUnshortlist(data.DB_DATA)
        appUnshortlist(viewAppId)
        setDialogUnshortlist(false)

        // Refresh data after successful unshortlisting
        await refreshDataAfterStatusChange("1", "Shortlisted");
      } else {
        showToast(`${data.ERROR_DESCRIPTION}`, 'error')
      }

    } catch (error) {
      console.log(error)
    }
  }

  const [dialogUnshortlist, setDialogUnshortlist] = useState(false)

  const handleDialogUnShort = (appId) => {
    console.log(appId)
    setDialogUnshortlist(!dialogUnshortlist)
  }

  const [dialogScore, setDialogScore] = useState(false)
  const [dataForScore, setdataForScore] = useState('')
  const handleDialogScore = (data) => {
    setdataForScore(data)
    setDialogScore(!dialogScore)
  }

  const [scoreInterview, setScoreInterview] = useState({
    round_id: '',
    appId: '',
    commentsI: '',
    interview_time: '',
    rating844: ''
  })

  const handleChangeRating = (field, value) => {
    setScoreInterview((prevState) => ({
      ...prevState,
      [field]: value
    }))

  }

  const handleInterviewScore = async (e) => {
    ///console.log('Interview Score Data:', dataForScore)
    e.preventDefault()

    // Get candidate_id from the dataForScore object (use candidate.id, not oneid)
    const candidate_id = dataForScore?.candidate?.id

    // Get app_id from the dataForScore object (application ID)
    const app_id = dataForScore?.id

    const interviewData = {
      app_id: app_id,
      candidate_id: candidate_id,
      rating: scoreInterview.rating844,
      comment: scoreInterview.commentsI
    }

    // console.log('Sending interview data:', interviewData)

    try {
      const response = await hireApi.settingInterviewScore(interviewData)
      const data = response.data
      console.log('Interview score response:', data)

      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        showToast('Interview score submitted successfully', 'success')

        // Reset the form
        setScoreInterview({
          round_id: '',
          appId: '',
          commentsI: '',
          interview_time: '',
          rating844: ''
        })

        // Close the dialog
        setDialogScore(false)

        // Refresh data after successful interview scoring
        await refreshDataAfterStatusChange("1", "Shortlisted");

      } else {
        showToast(`${data.ERROR_DESCRIPTION}`, 'error')
      }
    } catch (error) {
      console.error('Error submitting interview score:', error)
      showToast(error?.response?.data?.ERROR_DESCRIPTION, 'error')
    }
  }


  const handleShortlistItems = (id, ele) => {
    // alert("testtttt")
    console.log('this is data', ele);
    gettingRounds(`${ele?.vacancy?.id}`)
    switch (id) {
      case 1:
        setViewAppId(ele.id) // Changed from ele.app_id to ele.id
        handleDialogUnShort(ele.id) // Changed from ele.app_id to ele.id
        break;

      case 2:
        handleActionReject(ele.id) // Changed from ele.app_id to ele.id
        break;

      case 3:
        handleDialogScore(ele)
        break;

      case 4:
        navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/shortlisted/view_detail/${ele.id}`) // Changed from ele.app_id to ele.id
        break;

      default:
        console.log('Defualt case')
    }
  }

  const [openReInterview, setopenReInterview] = useState(false)
  const handleReInterDialog = async (data) => {
    // console.log('Re-interview dialog data:', data)
    // console.log('Data time_interview_id:', data.time_interview_id)
    // console.log('Data id:', data.id)

    // First, set the viewAppId with the data we have
    setViewAppId(data)

    // Then open the modal
    setopenReInterview(!openReInterview)
  }

  const [reInterviewData, setReInterviewData] = useState({
    appId: '',
    reInterview_time: '',
    re_comment: '',
    re_label: '',
    re_round_id: ''
  })

  const [reInterviewList] = useState({})
  const handleReInterviewData = async (e) => {
    // console.log('Re-interview data:', reInterviewData)
    e.preventDefault()

    console.log('viewAppId data:', viewAppId)
    console.log('viewAppId.time_interview_id:', viewAppId?.time_interview_id)

    // Create payload for the new re-interview endpoint
    const reInterviewPayload = {
      label: reInterviewData.re_label,
      round_id: reInterviewData.re_round_id,
      interview_id: viewAppId?.id || '',
      interview_time: reInterviewData.reInterview_time,
      comment: reInterviewData.re_comment,
      time_interview_id: viewAppId?.time_interview_id || ''
    }

    console.log('Sending re-interview payload:', reInterviewPayload)

    try {
      // Call the store function which will call the API
      const result = await Re_Interviewfn(reInterviewPayload)

      if (result.success) {
        showToast('Re-interview scheduled successfully', 'success')

        // Reset the form
        setReInterviewData({
          appId: '',
          reInterview_time: '',
          re_comment: '',
          re_label: '',
          re_round_id: ''
        })

        // Close the modal
        setopenReInterview(false)

        // Refresh data after successful re-interview scheduling
        await refreshDataAfterStatusChange("2", "Interviewed");
      } else {
        showToast(`${result.error || 'Failed to schedule re-interview'}`, 'error')
      }
    } catch (error) {
      console.error('Error scheduling re-interview:', error)
      showToast('Failed to schedule re-interview', 'error')
    }
  }

  const [acceptDialog, setAcceptDialog] = useState(false)
  const [acceptValues, setAcceptValues] = useState({
    appId: ''
  })

  // State for validation errors
  const [acceptFormErrors, setAcceptFormErrors] = useState({})

  // State for acceptance confirmation modal
  const [acceptanceConfirmationDialog, setAcceptanceConfirmationDialog] = useState(false)
  const [setrefreshData] = useState(false)
  const [acceptedApplicantData, setAcceptedApplicantData] = useState(null)

  // Shortlist Template Modal State
  const [shortlistTemplateDialog, setShortlistTemplateDialog] = useState(false)
  const [shortlistedApplicantData, setShortlistedApplicantData] = useState(null)

  const handleAcceptDialog = (appId = null) => {
    if (appId) {
      setViewAppId(appId)
    }
    setAcceptDialog(!acceptDialog)
    // Clear errors when opening dialog
    setAcceptFormErrors({})
  }

  // No validation needed for accept application since we removed Label and Reason fields

  const handleAcceptApp = async (e) => {
    e.preventDefault()

    // Find the current applicant data to get vacancy_id
    const currentApplicant = get_applicants_data?.find(app => app.id === viewAppId);

    if (!currentApplicant) {
      showToast('Applicant data not found', 'error');
      return;
    }

    const acceptData = {
      id: viewAppId,
      vacancy_id: currentApplicant.vacancy?.id
    }

    console.log('Accept Application Payload:', acceptData)
    console.log('Current Applicant Data:', currentApplicant)

    try {
      const response = await hireApi.acceptApplicant(acceptData)
      const data = response.data

      ////console.log('accept response:', data)

      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        ///showToast('Applicant Accepted Successfully', 'success')

        // Store complete API response data for confirmation modal
        const acceptedData = {
          id: viewAppId,
          candidate: data.DB_DATA.candidate,
          vacancy: data.DB_DATA.vacancy,
          label: acceptValues.labelA,
          acceptReason: acceptValues.acceptReason
        }

        console.log('Setting accepted applicant data for modal:', acceptedData)
        setAcceptedApplicantData(acceptedData)

        setAcceptValues({
          appId: ''
        })
        setAcceptDialog(false)
        setAcceptFormErrors({}) // Clear errors on successful submission

        ////navigate(`/hire/vacancies_list/all_applicants/0/applicant/view_detail/${data?.DB_DATA?.id}`)

        // Show acceptance confirmation modal


        // Refresh data after successful acceptance
        await refreshDataAfterStatusChange("2", "Interviewed");
        setAcceptanceConfirmationDialog(true)
      } else {
        showToast(`${data.ERROR_DESCRIPTION}`, 'error');
      }
    } catch (error) {
      console.log(error)
      showToast('Failed to accept applicant', 'error');
    }
  }

  // Handler for acceptance confirmation modal
  const handleAcceptanceConfirmationDialog = () => {
    setAcceptanceConfirmationDialog(!acceptanceConfirmationDialog)
  }

  const handleSendAcceptanceLetter = async (formData) => {
    try {
      console.log('Sending hiring message with data:', formData)

      // Prepare the API payload
      const apiPayload = {
        name: formData.candidateData?.candidate?.name || "",
        Position: formData.position,
        time_Position: formData.timePosition,
        annual_salary: formData.salary,
        Benefits: formData.benefits,
        start_date: formData.startDate,
        email: formData.email,
        phone_number: formData.phone
      }

      // console.log('API Payload:', apiPayload)

      // Call the API
      const response = await hireApi.sendHiringMessage(apiPayload)
      const data = response.data

      if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
        setAcceptanceConfirmationDialog(false)

        setAcceptedApplicantData(null)

        // Hire Employee drawer temporarily disabled — enroll via Add Employee instead
        // openDrawer();
        // settingDrawerTitle('Hire Employee');
        // settingDrawerSize(600);
        // settingComponent(<HireEmployeeDrawerContent ... />);

        showToast(
          'Congratulations on hiring new vacancy. Please enroll the employee.',
          'success'
        )
        // Pass candidate data to Add Employee and skip credentials screen (step 0)
        const candidate = formData?.candidateData?.candidate || null
        if (candidate) {
          try {
            localStorage.setItem('hire_prefill_candidate', JSON.stringify(candidate))
          } catch (e) {
            // ignore storage failure; navigation state will still carry it
          }
        }
        navigate('/employees/add_emp', { state: { prefillCandidate: candidate, fromHiring: true } })
      } else {
        showToast('Failed to send hiring message', 'error')
      }
    } catch (error) {
      console.error('Error sending hiring message:', error)
      showToast('Failed to send hiring message', 'error')
    }
  }

  /** Hire Employee side panel disabled for now — same post-hire path as acceptance flow. */
  const openHireEmployeeDrawer = async () => {
    showToast(
      'Congratulations on hiring new vacancy. Please enroll the employee.',
      'success'
    )
    navigate('/employees/add_emp')
  }

  const handleCloseAcceptanceConfirmation = () => {
    setAcceptanceConfirmationDialog(false)
    setAcceptedApplicantData(null)
  }

  // Shortlist Template Modal Handlers
  const handleShortlistTemplateDialog = () => {
    setShortlistTemplateDialog(!shortlistTemplateDialog)
  }

  const handleSendShortlistTemplate = async (templateData) => {
    try {
      console.log('Sending shortlist template:', templateData)

      // Prepare the API payload (name = greeting "Dear …", from modal form / candidate)
      const candidateName = (
        templateData.candidateName ||
        templateData.candidateData?.candidate?.name ||
        ''
      ).trim()

      const apiPayload = {
        name: candidateName,
        position: templateData.position,
        interview_date: templateData.interviewDate,
        start_time: templateData.startTime,
        end_time: templateData.endTime,
        details: templateData.details,
        dddress: templateData.address, // Note: API expects "dddress" (typo in API)
        Email: templateData.email,
        Phone: templateData.phone
      }

      console.log('API Payload:', apiPayload)

      // Call the API
      const response = await hireApi.sendShortlistMessage(apiPayload)
      const data = response.data

      if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
        showToast('Shortlist Email sent successfully', 'success')
        setShortlistTemplateDialog(false)
        setShortlistedApplicantData(null)
      } else {
        showToast('Failed to send shortlist message', 'error')
      }
    } catch (error) {
      console.error('Error sending shortlist template:', error)
      showToast('Failed to send shortlist message', 'error')
    }
  }

  const handleCloseShortlistTemplate = () => {
    setShortlistTemplateDialog(false)
    setShortlistedApplicantData(null)
  }

  // Hire Employee Drawer Content Component
  const HireEmployeeDrawerContent = ({ employeeData, candidateId }) => {
    const [formData, setFormData] = useState({
      branch: null,
      department: null,
      designation: null,
      work_policy: null,
      salary_template: null,
      reporting_manager: null,
      empID: "",
      joing_date: null
    });

    // Store candidate_id for API payload
    const [storedCandidateId, setStoredCandidateId] = useState(candidateId);

    // Update storedCandidateId when candidateId prop changes
    useEffect(() => {
      if (candidateId) {
        setStoredCandidateId(candidateId);
      }
    }, [candidateId]);

    // State for date picker
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Import useEmployees hook to get the same data as AddNewEmployee
    const {
      empBranches,
      dept_subDept,
      designations,
      policies,
      salaryTemplate,
      // handleDOB,
      fetchingAllBranches,
      gettingSubBranches,
      gettingPolicies,
      gettingSalayTemplate,
      gettingDesignation,
      branchesLoading,
      departmentsLoading,
    } = useEmployees();

    const hrPolicyDropdownLoading = useStore((state) => state.hrPolicyDropdownLoading);


    ///console.log('Employee Data for Hiring:', dept_subDept);

    // Fetch branch data when component mounts
    useEffect(() => {
      fetchingAllBranches();
    }, [fetchingAllBranches]);

    // Flatten department options (same logic as AddNewEmployee)
    const flattenOptions = (options) => {
      ////console.log('Flattening options:', options);
      if (!Array.isArray(options?.departments)) return [];

      const flattened = [];
      options?.departments.forEach(option => {
        flattened.push({
          value: option.id,
          label: option.name,
          level: 0
        });

        if (option.sub_departments && Array.isArray(option.sub_departments)) {
          option.sub_departments.forEach(subDept => {
            flattened.push({
              value: subDept.id,
              label: `  ${subDept.dept_name}`, // Indent sub-departments
              level: 1
            });
          });
        }
      });
      return flattened;
    };

    const handleInputChange = (name, value) => {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSelectChangeLocal = (selectedOption, fieldName) => {
      if (fieldName === 'branch') {
        // Reset department and designation when branch changes
        setFormData(prev => ({
          ...prev,
          [fieldName]: selectedOption,
          department: null,
          designation: null
        }));
        // Call the cascading functions
        gettingSubBranches(selectedOption.value);
        gettingPolicies();
        gettingSalayTemplate(selectedOption.value);
        gettingDesignation(selectedOption.value, true); // true indicates it's a branch_id
      } else if (fieldName === 'department') {
        setFormData(prev => ({
          ...prev,
          [fieldName]: selectedOption,
          designation: null // Reset designation when department changes
        }));
        gettingDesignation(selectedOption.value, false); // false indicates it's a dept_id
      } else {
        setFormData(prev => ({
          ...prev,
          [fieldName]: selectedOption
        }));
      }
    };


    // Handle date selection from date picker
    const handleDateSelect = (date) => {
      setSelectedDate(date);
      // Store the actual Date object, not the formatted string
      setFormData(prev => ({
        ...prev,
        joing_date: date
      }));
      setShowDatePicker(false);
    };

    // Handle input click to show date picker
    const handleDateInputClick = () => {
      setShowDatePicker(!showDatePicker);
    };

    // Close date picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (showDatePicker && !event.target.closest('.date-picker-container')) {
          setShowDatePicker(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showDatePicker]);

    // const handleDOB = (timeStamp, field) => {
    //     ////console.log(timeStamp, field)
    //     const date = format(timeStamp, "PPP")

    //     setFormData((prevState) => ({
    //         ...prevState,
    //         [field]: date
    //     }))
    // }

    const handleSubmit = async () => {
      // Validation
      if (!formData.branch) {
        showToast('Branch is required', 'error');
        return;
      }
      if (!formData.department) {
        showToast('Department is required', 'error');
        return;
      }
      if (!formData.designation) {
        showToast('Designation is required', 'error');
        return;
      }
      if (!formData.work_policy) {
        showToast('Work Policy is required', 'error');
        return;
      }
      if (!formData.salary_template) {
        showToast('Salary Template is required', 'error');
        return;
      }
      if (!formData.reporting_manager) {
        showToast('Reporting Manager is required', 'error');
        return;
      }
      if (!formData.empID.trim()) {
        showToast('Employee ID is required', 'error');
        return;
      }
      if (!formData.joing_date) {
        showToast('Joining Date is required', 'error');
        return;
      }

      // Convert the Date object to the required format
      const formattedDate = format(formData.joing_date, "yyyy-MM-dd");

      // Prepare API payload
      const hireEmployeePayload = {
        candidate_id: storedCandidateId, // Include candidate_id if available
        emp_id: formData.empID,
        emp_branch: formData.branch.value,
        emp_deptt_radio_btn: formData.department.value,
        designation: formData.designation.value,
        joining_date: formattedDate,
        salary_template: formData.salary_template.value,
        reporting_manager: formData.reporting_manager.value,
        wf_policy: formData.work_policy.value
      };

      console.log('Hiring employee with payload:', hireEmployeePayload);

      try {
        const response = await hireApi.hireEmployee(hireEmployeePayload);
        const data = response.data;

        if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
          showToast('Employee hired successfully!', 'success');

          // Reset form
          setFormData({
            branch: null,
            department: null,
            designation: null,
            work_policy: null,
            salary_template: null,
            reporting_manager: null,
            empID: "",
            joing_date: null
          });

          // Close drawer
          closeDrawer();
        } else {
          showToast(data.ERROR_DESCRIPTION || 'Failed to hire employee', 'error');
        }
      } catch (error) {
        console.error('Error hiring employee:', error);
        showToast(error?.response?.data?.ERROR_DESCRIPTION || 'Failed to hire employee', 'error');
      }
    };

    return (
      <div className="p-6">
        {/* Show candidate info if available */}
        {storedCandidateId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Hiring Candidate ID:</strong> {storedCandidateId}
            </p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          {/* Branch */}
          <div className="w-96">
            <label className="text-[#698592]">Select Branch</label>
            <CustomSelect
              placeHolderTitle="Branch"
              value={formData?.branch}
              options={empBranches?.map((branch) => ({
                value: branch.id,
                label: branch.branch_name,
              }))}
              onChangeHandler={(selectedOption) => handleSelectChangeLocal(selectedOption, "branch")}
              cStyle={true}
              menuLoading={branchesLoading}
              menuLoadingLabel="Loading branches..."
              customStyles={{
                control: (base) => ({
                  ...base,
                  fontSize: '0.175rem',
                }),
                singleValue: (base) => ({
                  ...base,
                  fontSize: '0.175rem',
                }),
                placeholder: (base) => ({
                  ...base,
                  fontSize: '0.175rem',
                }),
                option: (base) => ({
                  ...base,
                  fontSize: '0.14rem',
                  padding: '1px 3px',
                }),
                menu: (base) => ({
                  ...base,
                  fontSize: '0.14rem',
                }),
                menuList: (base) => ({
                  ...base,
                  fontSize: '0.14rem',
                }),
              }}
            />
          </div>

          {/* Department */}
          <div className="w-96">
            <label className="text-[#698592]">Select Department</label>
            <CustomSelect
              placeHolderTitle="Department"
              value={formData?.department}
              options={flattenOptions(dept_subDept)}
              onChangeHandler={(selectedOption) => handleSelectChangeLocal(selectedOption, "department")}
              cStyle={true}
              menuLoading={departmentsLoading}
              menuLoadingLabel="Loading departments..."
            />
          </div>

          {/* Designation */}
          <div className="w-96">
            <label className="text-[#698592]">Select Designation</label>
            <CustomSelect
              placeHolderTitle="Designation"
              value={formData?.designation}
              options={designations?.map((ele) => ({
                value: ele.id,
                label: ele.title,
              }))}
              onChangeHandler={(selectedOption) => handleSelectChangeLocal(selectedOption, "designation")}
              cStyle={true}
              customStyles={{
                control: (base) => ({
                  ...base,
                  fontSize: '0.175rem',
                }),
                singleValue: (base) => ({
                  ...base,
                  fontSize: '0.175rem',
                }),
                placeholder: (base) => ({
                  ...base,
                  fontSize: '0.175rem',
                }),
                option: (base) => ({
                  ...base,
                  fontSize: '0.14rem',
                  padding: '1px 3px',
                }),
                menu: (base) => ({
                  ...base,
                  fontSize: '0.14rem',
                }),
                menuList: (base) => ({
                  ...base,
                  fontSize: '0.14rem',
                }),
              }}
            />
          </div>

          {/* Work Policy */}
          <div className="w-96">
            <label className="text-[#698592]">Select Work Policy</label>
            <CustomSelect
              placeHolderTitle="Work Policy"
              value={formData?.work_policy}
              options={policies?.map((ele) => ({
                value: ele.id,
                label: ele.policy_name,
              }))}
              onChangeHandler={(selectedOption) => handleSelectChangeLocal(selectedOption, "work_policy")}
              cStyle={true}
              menuLoading={hrPolicyDropdownLoading}
              menuLoadingLabel="Loading policies..."
              customStyles={{
                control: (base) => ({
                  ...base,
                  fontSize: '0.175rem',
                }),
                singleValue: (base) => ({
                  ...base,
                  fontSize: '0.175rem',
                }),
                placeholder: (base) => ({
                  ...base,
                  fontSize: '0.175rem',
                }),
                option: (base) => ({
                  ...base,
                  fontSize: '0.14rem',
                  padding: '1px 3px',
                }),
                menu: (base) => ({
                  ...base,
                  fontSize: '0.14rem',
                }),
                menuList: (base) => ({
                  ...base,
                  fontSize: '0.14rem',
                }),
              }}
            />
          </div>

          {/* Salary Template */}
          <div className="w-96">
            <label className="text-[#698592]">Select Salary Template</label>
            <CustomSelect
              placeHolderTitle="Salary Template"
              value={formData?.salary_template}
              options={salaryTemplate?.map((ele) => ({
                value: ele.id,
                label: ele.name,
              }))}
              onChangeHandler={(selectedOption) => handleSelectChangeLocal(selectedOption, "salary_template")}
              customStyles={false}
            />
          </div>

          {/* Reporting Manager */}
          <div className="w-96">
            <label className="text-[#698592]">Select Reporting Manager</label>
            <CustomSelect
              placeHolderTitle="Reporting Manager"
              value={formData?.reporting_manager}
              options={[
                { value: 12333, label: "Manager 1" },
                { value: 12334, label: "Manager 2" },
                { value: 12335, label: "Manager 3" }
              ]}
              onChangeHandler={(selectedOption) => handleSelectChangeLocal(selectedOption, "reporting_manager")}
              customStyles={false}
            />
          </div>

          {/* Employee ID */}
          <div className="w-96">
            <Input
              label="Employee ID"
              value={formData.empID}
              name="empID"
              onChange={(e) => handleInputChange('empID', e.target.value)}
              placeholder="Employee ID"
            />
          </div>

          {/* Joining Date */}
          <div className="w-96 relative date-picker-container">
            <label className="text-[#698592] mb-2 block">Select a Joining Date</label>
            <Input
              label="Joining Date"
              onChange={() => null}
              value={formData.joing_date ? format(formData.joing_date, "PPP") : ""}
              name="joing_date"
              placeholder="September 6th, 2025"
              onClick={handleDateInputClick}
              readOnly
              className="cursor-pointer"
            />

            {/* Custom Date Picker */}
            {showDatePicker && (
              <div className="absolute top-full left-0 z-50 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-3">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Select Date</h3>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <Calendar
                    onChange={(date) => handleDateSelect(date)}
                    value={selectedDate}
                    className="border-0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => closeDrawer()}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Hire Employee
          </button>
        </div>
      </div>
    );
  };

  const handleInterviewItems = async (id, ele) => {
    ///console.log('ffffff', ele)
    switch (id) {
      case 1:
        // console.log('Accept')
        handleAcceptDialog(ele.id) // Pass the application ID to set viewAppId and open dialog
        gettingVacancyRounds(ele.id) // Changed from ele.app_id to ele.id

        break;

      case 2:
        // Get complete application data with time_interview_id before opening dialog
        try {
          ///console.log('Fetching complete app data for ID:', ele.id)
          //console.log('JWT token:', localStorage.getItem('jwt') ? 'Present' : 'Missing')

          const response = await fetch(`http://172.18.0.44:6179/api/v1/applications/applications/all?vacancy_id=&status=2&gender=&city=`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
              'Content-Type': 'application/json'
            }
          })

          console.log('Response status:', response.status)
          console.log('Response ok:', response.ok)

          if (response.ok) {
            const responseData = await response.json()
            console.log('API response STATUS:', responseData.STATUS)
            console.log('API response DB_DATA length:', responseData.DB_DATA?.length || 0)

            if (responseData.STATUS === 'SUCCESSFUL' && responseData.DB_DATA) {
              console.log('Looking for app with ID:', ele.id)
              console.log('Available app IDs:', responseData.DB_DATA.map(app => app.id))

              const completeAppData = responseData.DB_DATA.find(app => app.id === ele.id)
              console.log('Found complete app data:', completeAppData)

              if (completeAppData && completeAppData.time_interview_id) {
                console.log('Found time_interview_id:', completeAppData.time_interview_id)
                handleReInterDialog(completeAppData)
              } else {
                console.log('No time_interview_id found in complete data, checking original data')
                console.log('Original data time_interview_id:', ele.time_interview_id)
                handleReInterDialog(ele)
              }
            } else {
              console.log('API response not successful:', responseData)
              handleReInterDialog(ele)
            }
          } else {
            console.log('API call failed with status:', response.status)
            const errorText = await response.text()
            console.log('Error response:', errorText)
            handleReInterDialog(ele)
          }
        } catch (error) {
          console.error('Error fetching complete app data:', error)

          // Fallback: try to get data from existing store
          console.log('Trying fallback: checking existing store data')
          const existingAppData = allInterviewApp?.find(app => app.id === ele.id)
          if (existingAppData && existingAppData.time_interview_id) {
            console.log('Found time_interview_id in store data:', existingAppData.time_interview_id)
            handleReInterDialog(existingAppData)
          } else {
            console.log('No fallback data available, using original data')
            handleReInterDialog(ele)
          }
        }

        gettingRounds(`${ele?.vacancy?.id}`)
        break;

      case 3:
        handleActionReject(ele.id) // Changed from ele.app_id to ele.id
        break;

      case 4:
        navigate(`/hire/vacancies_list/all_applicants/${vacancyId}/interviewed/view_detail/${ele.id}`) // Changed from ele.app_id to ele.id
        break;

      default:
        console.log('Defualt case')
    }
  }

  const handleNavCards = (id) => {
    const vacancy = 0;
    // Tooba
    // Navigation of talent Pool Card
    switch (id) {
      case 1:
        navigate(`/hire/vacancies_list/all_applicants/${vacancy}/applicant`)
        // gettingAllPendingApp(vacancy)
        // gettingAllCount(vacancy)
        break;

      case 2:
        navigate(`/hire/vacancies_list/all_applicants/${vacancy}/shortlisted`)
        //////gettingAllShortlistedApp(vacancy)
        // gettingAllCount(vacancy)
        break;

      case 3:
        navigate(`/hire/vacancies_list/all_applicants/${vacancy}/interviewed`)
        gettingAllInterviewApp(vacancy)
        // gettingAllCount(vacancy)
        break;

      case 4:
        navigate(`/hire/vacancies_list/all_applicants/${vacancy}/accepted`)
        /// gettingAcceptedApp(vacancy)
        // gettingAllCount(vacancy)
        break;

      case 5:
        navigate(`/hire/vacancies_list/all_applicants/${vacancy}/rejected`)
        // gettingRejectedApp(vacancy)
        // gettingAllCount(vacancy)
        break;

      case 6:
        navigate('/hire/talent_pool')
        break;

      default:
        console.log('Defualt case')

    }
  }

  const [loading, setLoading] = useState(false)

  // <-- Delete -->

  const [deleteDialog, setDeleteDialog] = useState(false)
  const handleDeactivate = (ele) => {
    console.log(':::;', ele)
    setDeleteDialog(!deleteDialog)
  }

  const handleCalendar = (timeStamp, field) => {
    console.log(timeStamp, field)
    const date = format(timeStamp, "PPP")

    setDeactiveValues((prevState) => ({
      ...prevState,
      [field]: timeStamp
    }))
  }

  const [deactiveValues, setDeactiveValues] = useState({
    appId: '',
    status: '',
    start_date: '',
    end_date: ''
  }
  )

  const handleDeactivateVac = async () => {
    // setLoading(true)
    const deactivateData = {
      appId: deactiveValues.appId,
      status: deactiveValues.status
    }
    try {
      const response = await hireApi.deactivateVac(deactivateData)
      const data = response.data
      console.log('deleteed', data)

      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        showToast('Applicant Deactivated Successfully', 'success')
        deactivcatingVacancy(deactiveValues.appId)
        setDeleteDialog(false)
        // setLoading(false)
      } else {
        showToast(`${data.ERROR_DESCRIPTION}`, 'error')
      }

    } catch (error) {
      console.log(error)
    }
  }


  const handlaActivateForm = async (e) => {

    console.log(deactiveValues.appId)
    console.log(deactiveValues.status)

    e.preventDefault()

    const activateDataForm = {
      vac_id: deactiveValues.appId,
      status: deactiveValues.status,
      start_date: deactiveValues.start_date,
      end_date: deactiveValues.end_date
    }
    try {
      const response = await hireApi.activateVac(activateDataForm)
      const data = response.data
      console.log('activated', data)

      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        showToast('Vacancy Activated Successfully', 'success')
        setDeactiveValues({
          appId: '',
          status: '',
          start_date: '',
          end_date: ''
        })

      } else {
        showToast(`${data.ERROR_DESCRIPTION}`, 'error')
      }

    } catch (error) {
      console.log(error)
    }

  }

  const handleActivateVac = async () => {
    // setLoading(true)
    const activateData = {
      vac_id: deactiveValues.appId,
      status: deactiveValues.status,
    }
    try {
      const response = await hireApi.checkActivateVac(activateData)
      const data = response.data
      console.log('activated', data)

      if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
        showToast('Vacancy Activated Successfully', 'success')
        activcatingVacancy(deactiveValues.appId)
        setDeleteDialog(false)
        // setLoading(false)

      } else if (response.status === 200 && data.STATUS === 'ERROR') {
        openDrawer()
        settingDrawerSize(500)
        settingDrawerTitle('Activate Vacancy')
        settingComponent(<ActivateVacancyForm
          // deactiveValues = {deactiveValues}
          handleChangeActive={handleChangeActive}
          handlaActivateForm={handlaActivateForm}
        />)
        showToast(`${data.ERROR_DESCRIPTION}`, 'error')
        setDeleteDialog(false)
      }

    } catch (error) {
      console.log(error)
    }
  }

  const handleMenuVacancies = (id, ele, hireStatus) => {
    console.log('Vacancy', ele)
    console.log('Vacancyyy', hireStatus)

    switch (id) {
      case 1:
        handleDeactivate(ele.id)
        setDeactiveValues((prevState) => ({
          ...prevState,
          appId: ele.id,
          status: hireStatus
        }))
        break;

      case 2:
        console.log('Deactivate', ele.status)

        handleDeactivate(ele)
        setDeactiveValues((prevState) => ({
          ...prevState,
          appId: ele.id,
          status: hireStatus
        }))

        break;
      default:
        console.log('Default case')
    }
  }

  const [statusFilter, setStatusFilter] = useState(null)
  const [yearFilter, setYearFilter] = useState(null);
  const [monthFilter, setMonthFilter] = useState(null);


  const handleFilterChangeVacancy = (filterName, value) => {
    switch (filterName) {
      case 'statusFilter':
        setStatusFilter(value);
        break;
      case 'yearFilter':
        setYearFilter(value);
        break;
      case 'monthFilter':
        setMonthFilter(value);
        break;
      default:
        break;
    }

    const data = {
      statusFilter: filterName === 'statusFilter' ? value : statusFilter,
      yearFilter: filterName === 'yearFilter' ? value : yearFilter,
      monthFilter: filterName === 'monthFilter' ? value : monthFilter,
    };
    gettingAllVacanciesList(data);
    console.log(value);
  };


  const [gender, setGender] = useState(null)
  const [ageLower, setAgeLower] = useState(null)
  const [ageUpper, setAgeUpper] = useState(null)

  const handleFilterChangeTalent = (filterName, value) => {
    switch (filterName) {
      case 'gender':
        setGender(value);
        break;
      case 'ageLower':
        setAgeLower(value);
        break;
      case 'ageUpper':
        setAgeUpper(value);
        break;
      default:
        break;
    }

    const data = {
      gender: filterName === 'gender' ? value : gender,
      ageLower: filterName === 'ageLower' ? value : ageLower,
      ageUpper: filterName === 'ageUpper' ? value : ageUpper,
    };
    gettingTalentPoolData(data);
    console.log(value);
  };

  const [talentPoolData, setTalentPoolData] = useState([])
  const [talentPoolPagination, setTalentPoolPagination] = useState(null)
  const [talentPoolFilters, setTalentPoolFilters] = useState({
    page: 1,
    gender: '',
    age_from: '',
    age_to: '',
    label_id: ''
  })

  const fetchTalentPool = async (filters = {}) => {
    try {
      const response = await hireApi.getTalentPool(filters)
      if (response.data.STATUS === 'SUCCESSFUL') {
        const data = response.data.DB_DATA
        if (filters.page === 1) {
          setTalentPoolData(data.talent_pool)
        } else {
          setTalentPoolData(prev => [...prev, ...data.talent_pool])
        }
        setTalentPoolPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching talent pool:', error)
    }
  }

  const handleTalentPoolFilterChange = (filterName, value) => {
    const newFilters = {
      ...talentPoolFilters,
      [filterName]: value,
      page: 1 // Reset to first page when filters change
    }
    setTalentPoolFilters(newFilters)
    fetchTalentPool(newFilters)
  }

  const loadMoreTalentPool = () => {
    if (talentPoolPagination && talentPoolPagination.page < talentPoolPagination.pages) {
      const newFilters = {
        ...talentPoolFilters,
        page: talentPoolPagination.page + 1
      }
      setTalentPoolFilters(newFilters)
      fetchTalentPool(newFilters)
    }
  }

  // Removed automatic talent pool fetch from useHire hook
  // Talent pool data is fetched by the dedicated TalentPool component using useTalentPoolServices
  // This prevents unnecessary API calls when viewing rejected applications or other pages

  return {
    hireMenu, gettingAllVacanciesList, mountHireList, allVacanciesList, hireCardList, toggleMenuHire, openMenuHire, hireItems, handleMenuItemsHire, hireShareItems, toggleMenuShare, openMenuShare, handleVacancyChange, vacancySearch, handleAllApps, handleBackVacancies, allApplicantsMenu, allPendingApp, allShortlistedApp,
    ///////////gettingAllShortlistedApp,
    allInterviewApp, allAcceptApp, allRejectApp, gettingAllInterviewApp,
    /// gettingAcceptedApp,
    gettingRejectedApp, actionShortlistMenu, handleNavigateView, actionHireMenu, viewPending, getViewDataPending, handleClose, openDialogShortlist, hanldeActionsItems, setOpenDialogShortlist, handleActionShortlist, allRounds, genderOptions,
    addToShortlist, gettingStarredApp, allStarredApp, handleChangeShortlist, addShortlistValues, handleChangeRound, openDialogReject, setOpenDialogReject, handleActionReject, rejectValues, handleRejectApp, handleStarClick, starred, handleChangeStar, handleShortlistItems, unShortlist, dialogUnshortlist, handleDialogUnShort, actionInterviewedMenu, dialogScore, setDialogScore, handleDialogScore, handleInterviewScore,
    scoreInterview, handleChangeRating, handleInterviewItems, openReInterview, setopenReInterview, handleReInterDialog, viewAppId, reInterviewData, handleReInterviewData, openTalentPool, setOpenTalentPool, handleActionTalentPool, addTalentPoolValues, reInterviewList, handleAddTalentPool, handleNavCards, allTalentPool: talentPoolData, gettingTalentPoolData, handlaActivateForm, handleCalendar, handleFilterChangeVacancy, filterByStatusMenu, handleMenuVacancies,
    handleDeactivate, deactiveValues, acceptDialog, setAcceptDialog, handleAcceptApp, acceptValues, acceptFormErrors, handleChangeActive, starredIndexes, handleActivateVac, loading, deleteDialog, setDeleteDialog, handleDeactivateVac, handleFilterChangeTalent, handleAcceptDialog, gettingVacancyRounds, vacRounds, get_record,
    acceptanceConfirmationDialog, handleAcceptanceConfirmationDialog, acceptedApplicantData, handleSendAcceptanceLetter, handleCloseAcceptanceConfirmation,
    shortlistTemplateDialog, handleShortlistTemplateDialog, shortlistedApplicantData, handleSendShortlistTemplate, handleCloseShortlistTemplate,
    loadMoreTalentPool, pagination: talentPoolPagination, Re_Interviewfn, Re_Interview_data,
    get_rejected_app_data, get_rejected_app, rejectedPaginationData, gettingViewPending, dataForScore, HireEmployeeDrawerContent,
    openDrawer, closeDrawer, settingDrawerTitle, settingDrawerSize, settingComponent, fetchingAllBranches, openHireEmployeeDrawer,
    City_data, gettingCitiesByCountry,
  }
}

export default useHire