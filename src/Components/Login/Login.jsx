import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import firstImg from '../../assets/images/img1.jpg';
import secondImg from '../../assets/images/img2.jpg';
import thirdImg from '../../assets/images/img3.jpg';
import fourthImg from '../../assets/images/img4.jpg';
import fifthImg from '../../assets/images/img5.jpg';
import { FaEnvelope, FaPhoneAlt } from 'react-icons/fa';
import { FaApple } from 'react-icons/fa6';
import { IoLogoGooglePlaystore } from 'react-icons/io5';
import empLogo from '../../assets/images/empleado-logo.png'
import { AnimatePresence, motion } from 'framer-motion'
import { isTokenValid } from '../../Authentication/jwt_decode';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  
  // Check if user is already authenticated and redirect to home
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token && isTokenValid()) {
      // User is authenticated, redirect to home page
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const token = localStorage.getItem('jwt');
      if (token && isTokenValid()) {
        // If user tries to go back to login page, redirect to home
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  // Array of image URLs
  const images = [
    firstImg,
    secondImg,
    thirdImg,
    fourthImg,
    fifthImg
  ];

  // State to keep track of the current image
  const [currentImage, setCurrentImage] = useState(0);

  const [signinValue, setSigninValue] = useState({
    userEmail: '',
  })
  const handleChange = (e) => {
    const { name, value } = e.target
    setSigninValue((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }
  const singinHandler = async (e) => {
    e.preventDefault()
    try {

      // production_url

      /// window.location.href = `https://oneid.veevotech.com/login?app_id=D8zgtKD8hA9MK&action=launch_app&username=${signinValue.userEmail}`
      //develpment_url
      /// window.location.href = `http://172.18.0.44:6199/login?app_id=test250463mb&action=launch_app&username=${signinValue.userEmail}`

      window.location.href= 'http://172.18.0.44:6199/login';

    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((currentImage) => (currentImage + 1) % images.length);
    }, 4000); // Interval changed to 5 seconds for smoother transition

    return () => clearInterval(interval);
  }, []);

  // const variants = {
  //   enter: { scale: 1.25 },
  //   center: { scale: 1, transition: { duration: 2, ease: "easeOut" } },
  //   exit: { scale: 1.1, transition: { duration: 2, ease: "easeIn" } }
  // };
  const variants = {
    enter: {
      opacity: 0.5,
      scale: 2.25,
      transition: { duration: 2.5 },
      rotate: 15
    },
    center: {
      opacity: 0.5,
      scale: 1,
      transition: { duration: 2.5, ease: "easeInOut" },
      rotate: 0
    },

  };

  return (
    <div className='h-screen grid grid-cols-2'>
      <div className='w-full relative overflow-hidden bg-black'>
        {/* <div className='absolute top-0 right-0 bottom-0 left-0 bg-image-custom' style={{ backgroundImage: `url(${images[currentImage]})`}}></div> */}
        {/* <AnimatePresence> */}

        <AnimatePresence>
          <motion.div
            className='absolute inset-0 bg-cover bg-center'
            style={{ backgroundImage: `url(${images[currentImage]})` }}
            key={currentImage}
            variants={variants}
            initial="enter"
            animate="center"
          />
        </AnimatePresence>
        <div className='relative z-10 text-white flex h-full'>
          <div className='flex flex-col w-full justify-between'>
            <div className='flex-1  flex items-end justify-end'>
              <div className='flex flex-col gap-1'>

                <button className='flex items-center justify-center text-[12px] h-[30px] w-[100px] rounded-l-full bg-[#007bff] text-fff'>Login</button>
                <button className='flex items-center justify-center text-[12px] h-[30px] w-[100px] rounded-l-full bg-white text-black'>Register</button>
              </div>
            </div>
            <div className='flex-1 flex items-end p-2'>
              <div className='text-[12px] flex flex-col gap-2'>
                <div>
                  <span>We always love to support you</span>
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-[#007BFF]'><FaEnvelope /></span>
                    <span>Biz@veevotech.com</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-[#007BFF]'><FaPhoneAlt /></span>
                    <span>UAN +92-304-111 8333</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex items-center justify-center bg-white'>
        <form onSubmit={singinHandler} className='flex flex-col gap-4'>
          <div className='flex flex-col ga-1'>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0, 0.21, 0.2, 0.2]
              }}
            >
              <img className='h-12' src={empLogo} alt='logo' />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                ease: [0, 0.21, 0.2, 0.2]
              }}
              className='text-[13px] text-[#646464]
          '>
              <span>Welcome, Start managing your work force in a digital way!</span>
            </motion.div>
          </div>
          <motion.div className='flex flex-col gap-2'
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              ease: [0, 0.21, 0.2, 0.2]
            }}
          >
            {/* <div className='flex items-center justify-between text-[13px] border-b border-b-[#e7e7e7] pr-3 pl-1 py-1'>

              <input placeholder='Email/Contact No/UserName' className='outline-none w-full' name='userEmail' onChange={handleChange} />
              <span className='text-[#a1a1a1]'><FaEnvelope /></span>
            </div> */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.4,
                ease: [0, 0.21, 0.2, 0.2]
              }}
            >
              <button className='text-[#343A40] capitalize rounded-none border border-[#343A40] text-[13px] px-3 py-2 hover:text-white hover:bg-[#343A40] ease-out duration-1000 transition-hover'>Log in Using OneID</button>
            </motion.div>
          </motion.div>
          <div className='flex flex-col gap-2 text-[15px]'>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.6,
                ease: [0, 0.21, 0.2, 0.2]
              }}
            >
              <span>Get Empleado from</span>
            </motion.div>
            <motion.div className='flex items-center gap-3'
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.7,
                ease: [0, 0.21, 0.2, 0.2]
              }}
            >
              <button className="flex items-center gap-2 text-[#dc3545] capitalize rounded-none border border-[#dc3545] text-[13px] px-4 py-2 hover:text-white hover:bg-[#dc3545] ease-out duration-1000 transition-hover">
                <span><IoLogoGooglePlaystore /></span>
                Google Play
              </button>
              <button className="flex items-center gap-2 text-[#343A40] capitalize rounded-none border border-[#343A40] text-[13px] px-4 py-2 hover:text-white hover:bg-[#343A40] ease-out duration-1000 transition-hover">
                <span><FaApple /></span>
                App Store
              </button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
