export const getAllYearsHire = () => {
  const startYear = 2016;
  const currentYear = new Date().getFullYear();
  const years = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }

  return years;
};

  export const getAllAge =()=> {
    const startAge = 18;
    const endAge = 60;
    const ages = [];
  
    for (let age = startAge; age <= endAge; age++) {
      ages.push(age);
    }
  
    return ages;
  }