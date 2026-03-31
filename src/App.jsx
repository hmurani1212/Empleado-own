import { useLocation } from 'react-router';
import { useNavigate } from 'react-router';
import { Header, SideMenu } from './Components';
import { Routers } from './Routers';
import useStore from './Store/store';
import { getLocalStorage, settingLocalStorage } from './Authentication/localStorageServices';
import { expireJwtLocalStorage } from './Authentication/expirationJWT';
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef } from 'react';
import CustomDrawer from './Components/CustomDrawer/CustomDrawer';
import SideMenuMobileView from './Components/SideMenuMobileView/SideMenuMobileView';
import empLogo from './assets/images/empleado-logo.png'
import { Toaster } from './Components/Toaster/Toaster';
import GlobalAttendanceReportListener from './Components/GlobalAttendanceReportListener/GlobalAttendanceReportListener';
import 'react-calendar/dist/Calendar.css';

const App = () => {
  const toggleState = useStore((state) => state.sideMenuToggleState)
  const mobilevViewFalse = useStore((state) => state.mobilevViewFalse)
  const mobilevToggleFalse = useStore((state) => state.mobilevToggleFalse)
  const isAuthenticated = useStore((state) => state.isAuthenticated)
  const isAuthLoading = useStore((state) => state.isAuthLoading)
  const setAuthenticationState = useStore((state) => state.setAuthenticationState)

  // Authentication functions
  const checkAuthentication = useStore((state)=> state.checkAuthentication)
  const getUserDataFromToken = useStore((state)=> state.getUserDataFromToken)

  // Removed unused dashboardDataFunc - dashboard API is now handled by individual components


  // for Drawer
  const drawerOpen = useStore((state) => state.drawerOpen)
  const closeDrawer = useStore((state) => state.closeDrawer)
  const childComponent = useStore((state) => state.childComponent)
  const drawerTitle = useStore((state) => state.drawerTitle)
  const drawerSize = useStore((state) => state.drawerSize)

  const location = useLocation()
  const navigate = useNavigate()
  // Login UI at `/` (or legacy `/login`) only when there is no JWT — avoids hard-depends on `/login` for SPA
  const jwtInStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('jwt') : null
  const isLogInRoute =
    !jwtInStorage &&
    (location.pathname === '/' || location.pathname === '/login')
  
  // Use refs to prevent infinite loops
  const hasProcessedAuthRef = useRef(false);
  const intervalRef = useRef(null);

  // Check if current route is a career page route
  const isCareerRoute = location.pathname.startsWith('/CareerApp/') || location.pathname.startsWith('/career-portal/');
  const isEmployeeProfileRoute = location.pathname.startsWith('/employee-profile/');

  // Show main layout only for non-login and non-career routes
  const showMainLayout = !isLogInRoute && !isCareerRoute;
//test
//testing 
  useEffect(() => {
    // Prevent duplicate processing on re-renders
    if (hasProcessedAuthRef.current) return;
    
    const processAuthentication = async () => {
      try {
        const currentUrl = window.location;
        const urlParams = new URLSearchParams(currentUrl.search);
        const tokenFromUrl = urlParams.get("token");
        const jwtToken = getLocalStorage();

        // If token comes from URL (e.g., from role switch or login), process it
        // This handles role switching where we need to replace old token with new one
        if (tokenFromUrl) {
          // Clear old localStorage data if token is coming from URL (role switch scenario)
          if (jwtToken) {
            localStorage.clear();
          }
          // Save new token from URL
          localStorage.setItem("jwt", tokenFromUrl);
        }

        const localStorageItem = localStorage.getItem('jwt')

        // If user is on login route but has a valid token, redirect to home
        if (isLogInRoute && localStorageItem) {
          try {
            const decode = jwtDecode(localStorageItem);
            const currentTime = Math.floor(Date.now() / 1000);
            if (decode.exp > currentTime) {
              // Token is valid, redirect to home
              navigate('/', { replace: true });
              hasProcessedAuthRef.current = true;
              return;
            }
          } catch (e) {
            // Token is invalid, continue to login page
          }
        }

        if (!localStorageItem) {
          setAuthenticationState(false, false)
          // Full reload to `/` so the app always boots from a URL the static host serves (avoids `/login` 404)
          if (window.location.pathname !== '/') {
            window.location.href = '/'
          }
          hasProcessedAuthRef.current = true;
        } else {
          // Decode and save JWT data
          const decode = jwtDecode(localStorageItem)
          for (const key in decode) {
            if (decode.hasOwnProperty(key)) {
              const value = decode[key];
              settingLocalStorage(key, value);
            }
          }

          // Clean up URL parameters
          window.history.replaceState({}, document.title, currentUrl.origin + currentUrl.pathname);

          // Set authentication as ready
          setAuthenticationState(true, false)

          // Initialize authentication check
          if (!isLogInRoute) {
            checkAuthentication();
            getUserDataFromToken();
          }

          // Set up JWT expiration check - clear any existing interval first
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          intervalRef.current = setInterval(expireJwtLocalStorage, 60000);
          
          hasProcessedAuthRef.current = true;
        }
      } catch (error) {
        console.error('Authentication processing error:', error)
        setAuthenticationState(false, false)
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
        hasProcessedAuthRef.current = true;
      }
    }

    processAuthentication()
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Handle browser back/forward buttons to prevent accessing login when authenticated
  const role = JSON.parse(localStorage.getItem('role_id'));
  useEffect(() => {
    const handlePopState = () => {
      const token = localStorage.getItem('jwt');
      const currentPath = window.location.pathname;
      if (token && currentPath === '/login') {
        try {
          const decode = jwtDecode(token);
          const currentTime = Math.floor(Date.now() / 1000);
          if (decode.exp > currentTime) {
            // Token is valid, redirect to home
            navigate('/', { replace: true });
          }
        } catch (e) {
          // Token is invalid, allow access to login
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only set up listener once

  // Initialize authentication state on first load
  useEffect(() => {
    // If we're on login route and no token exists, set as not authenticated
    if (isLogInRoute && !localStorage.getItem('jwt')) {
      setAuthenticationState(false, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Toggle body class for employee profile scroll styling
  useEffect(() => {
    const className = 'employee-profile-page';
    if (isEmployeeProfileRoute) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }

    return () => {
      document.body.classList.remove(className);
    };
  }, [isEmployeeProfileRoute]);

  // Show loading screen while authentication is being processed
  // if (isAuthLoading) {
  //   return (
  //     <div className='h-screen w-full flex items-center justify-center bg-gray-50'>
  //       <div className='text-center'>
  //         <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
  //         <p className='text-gray-600'>Authenticating...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // Show login page if not authenticated and on login route
  if (!isAuthenticated && isLogInRoute) {
    return (
      <div className='h-screen w-full'>
        <Routers />
      </div>
    )
  }


  // Redirect to login if not authenticated and not on login route
  if (!isAuthenticated && !isLogInRoute) {
    return null // Will redirect to login via useEffect
  }

  return (
    <div className='flex flex-col h-screen w-full relative overflow-hidden bg-white'>

      <div className="flex-none z-50">
        {showMainLayout && <Header />}
      </div>

      <div className='flex flex-1 overflow-hidden relative'>
        {showMainLayout &&
          <div className={`${showMainLayout && 'hidden lg:block transition-all duration-300'} ${toggleState ? 'w-20' : 'w-64'} h-full border-r border-gray-100 bg-white shadow-sm z-40`}>
            <SideMenu
              toggleState={toggleState}
            />
          </div>
        }
        <div
          className={`flex-1 h-full overflow-y-auto p-6 bg-background transition-all duration-300 relative ${isEmployeeProfileRoute ? 'employee-profile-scroll' : 'customScroll'}`}
        >
          <div className="min-h-full">
            <Routers />
          </div>
          {/* <div> */}
          {/* <Footer /> */}
          {/* </div>   */}
        </div>
      </div>


      <div>
        {showMainLayout && <Toaster />}
        {!isLogInRoute && <GlobalAttendanceReportListener />}
        <CustomDrawer

          open={mobilevViewFalse}
          closeDrawer={mobilevToggleFalse}
          compo={
            <SideMenuMobileView
              toggleState={toggleState}
            />
          }
          direction="left"
          widthSize={300}
          customImg={true}
          image={empLogo}

        />

        {drawerOpen && (

          <CustomDrawer

            open={drawerOpen}
            closeDrawer={closeDrawer}
            compo={childComponent}
            title={drawerTitle}
            //  direction="left"
            widthSize={drawerSize}
          //  customImg ={true}
          //  image = {empLogo}

          />
        )}


      </div>

    </div>
  )
}

export default App