export const getAllYearsHire =()=> {
    const startYear = 2015;
    const endYear = 2025;
    const years = [];

    for (let year = endYear; year >= startYear; year--) {
      years.push(year);
    }

    return years;
  }

  export const getAllAge =()=> {
    const startAge = 18;
    const endAge = 60;
    const ages = [];
  
    for (let age = startAge; age <= endAge; age++) {
      ages.push(age);
    }
  
    return ages;
  }