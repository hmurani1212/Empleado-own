export const shiftTime = (a, b) => {

  let shift = '';
  let dayChange = b<=a;


  // if(a <= b){
  //   dayChange = true
  //   console.log('kkk',a,b)
  // }
//   console.log('st', a);
//   console.log('ct', b);

  if (a >= '06' && b <= '16' && !dayChange) {
    
    shift = 'Morning Shift';
  } else if (a >= '16' && b <= '23' && !dayChange) {
    // console.log('eShift');
    shift = 'Evening Shift';
  } else if (a >= '0' && a < '06' && !dayChange) {
    // console.log('nShift');
    shift = 'Night Shift';
  }else{
    // console.log('hello else')
    
    if(b > '22'){
        shift = 'Night Shift'

    }else if(b > '19'){
        shift = 'Evening Shift'
    }else if(b < '06'){
        shift = 'Night Shift'
        // console.log('**********')  
    }
    else{
        shift = 'Morning Shift'
    }
  }

  return shift;
};



