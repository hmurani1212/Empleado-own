export const  getLocalStorage = () => {
  const localStorageItem = localStorage.getItem('jwt');
  // console.log('Token is recived', localStorageItem);
  return localStorageItem

};


export const settingLocalStorage = (key, value) => {
 
  if (key && value !== undefined) {
    if(key === "scope" && value === "admin") {
      value="Admin"
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to local storage (key: ${key}):`, error);
    }
  }


};