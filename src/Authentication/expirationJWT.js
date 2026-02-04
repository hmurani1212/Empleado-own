export const expireJwtLocalStorage =(exp, navigate)=>{
   const currentTime = Math.floor(Date.now() / 1000);

   if(exp < currentTime){
      localStorage.clear();
      navigate('/login');
   }
}

