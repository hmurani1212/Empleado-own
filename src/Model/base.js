import axios from "axios";
import { Traingin_Base_Url, inbox_Url, BASE_URL, Performance_BASE_URL, HIRE_BASE_URL, EXPENSE_BASE_URL, CORE_BASE_URL, approve_flow_url, notes_pool_url, notices_url, shift_planner, leave_planner, attendance_url, payroll, File_BASE_URL } from "./BaseUri";
import { getLocalStorage } from "../Authentication/localStorageServices";
import { setupAllAuthInterceptors } from "../services/__axiosInterceptors";

// console.log('getLocalStoragegetLocalStorage', getLocalStorage())
// const jwt=""

const currentUrl = window.location;

const urlParams = new URLSearchParams(currentUrl.search);
const token = urlParams.get("token");
let jwt

jwt = getLocalStorage();
if (!jwt) {
  jwt = token
}




export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    // 'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}`,
  }
});



export const performanceAxiosInstance = axios.create({
  baseURL: `${Performance_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}`,
  }
});


export const axiosInstanceFile = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${jwt}`,

  }
});


export const axiosInstanceHire = axios.create({
  baseURL: `${HIRE_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}`,
  }
});



export const axiosInstancecoremodule = axios.create({
  baseURL: `${CORE_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwt}`,
  }
});



export const traininginstancemodeule = axios.create({
  baseURL: `${Traingin_Base_Url}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
});
export const Inboxinstancemodeule = axios.create({
  baseURL: `${inbox_Url}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
});


export const OneIDinstancemodeule = axios.create({
  baseURL: `${inbox_Url}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
})

export const approvel_flow = axios.create({
  baseURL: `${approve_flow_url}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
})

// export const NotesPoolinstancemodeule = axios.create({
//   baseURL: `${notes_pool_url}`,
//   headers: {
//     'Content-type': 'application/json',
//     'Authorization': `Bearer ${jwt}`
//   }
// })


export const attencedenceInstence = axios.create({
  baseURL: `${attendance_url}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
})

// Expense API Instance
export const expenseAxiosInstance = axios.create({
  baseURL: `${EXPENSE_BASE_URL}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
})


// const axiosInstance = () => {
//   return axios.create({
//     headers: {
//       Authorization: Bearer ${getToken()},
//     },
//   });
// };


// axiosInstance.interceptors.request.use(
//   (config) => {
//     const jwtToken = getLocalStorage();
//     console.log('jwtToken in base',jwtToken)
//     if (jwtToken) {
//       config.headers['Authorization'] = `Bearer ${jwtToken}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );


export const NotesPoolinstancemodeule = axios.create({
  baseURL: `${notes_pool_url}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
})

export const NotesPoolFileInstance = axios.create({
  baseURL: `${notes_pool_url}`,
  headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${jwt}`
  }
})

export const Noticesinstancemodule = axios.create({
  baseURL: `${notices_url}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
})

export const ShiftPlannerinstancemodule = axios.create({
  baseURL: `${shift_planner}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
})


export const LeavePlannerinstancemodule = axios.create({
  baseURL: `${leave_planner}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
});

export const payRollinstancemodule = axios.create({
  baseURL: `${payroll}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
});

export const MobileAttendanceinstancemodule = axios.create({
  baseURL: `${File_BASE_URL}`,
  headers: {
    'Content-type': 'application/json',
    'Authorization': `Bearer ${jwt}`
  }
});



// const axiosInstance = () => {
//   return axios.create({
//     headers: {
//       Authorization: Bearer ${getToken()},
//     },
//   });
// };


// axiosInstance.interceptors.request.use(
//   (config) => {
//     const jwtToken = getLocalStorage();
//     console.log('jwtToken in base',jwtToken)
//     if (jwtToken) {
//       config.headers['Authorization'] = `Bearer ${jwtToken}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Setup authentication interceptors for all instances
// This will handle token expiration and authentication errors automatically
setupAllAuthInterceptors();

export default axiosInstance;