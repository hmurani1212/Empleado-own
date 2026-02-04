import { colors } from "./__appServicesData";


export function titleNameAlpha (title){
    // Add null/undefined check
    if (!title || typeof title !== 'string') {
        return {
            firstLetter: 'U',
        }
      }
    // Safety check for undefined, null, or empty title
    if (!title || typeof title !== 'string' || title.trim() === '') {
        return {
            firstLetter: '?',
            bgColor: '#000',
        };
    }
    
    const firstLetter = title.charAt(0).toUpperCase();
    const colorObj = colors.find(obj => obj[firstLetter]);

  if (colorObj) {
    const { bg: bgColor } = colorObj[firstLetter];
    return {
      firstLetter,
      bgColor,
    };
  }

  return {
    firstLetter,
    bgColor: '#000', // Replace with your default color
  };
}

export  const hexToRGBA = (hex, opacity) =>{
  let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}