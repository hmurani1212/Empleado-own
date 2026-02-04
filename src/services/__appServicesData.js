export const colors = [
  { A: { bg: '#B4F5DE' } },
  { B: { bg: '#BDB3F8' } },
  { C: { bg: '#FEACC0' } },
  { D: { bg: '#DFE590' } },
  { E: { bg: '#E7B6D6' } },
  { F: { bg: '#F69797' } },
  { G: { bg: '#F69797' } },
  { H: { bg: '#F5DBB4' } },
  { I: { bg: '#B3D3F8' } },
  { J: { bg: '#ACE5FE' } },
  { K: { bg: '#EEACFE' } },
  { L: { bg: '#F1F99B' } },
  { M: { bg: '#DFE590' } },
  { N: { bg: '#E5B490' } },
  { O: { bg: '#CEB6E7' } },
  { P: { bg: '#F697E1' } },
  { Q: { bg: '#F7F99B' } },
  { R: { bg: '#B4C2F5' } },
  { S: { bg: '#B3F8EF' } },
  { T: { bg: '#EEACFE' } },
  { U: { bg: '#CAE590' } },
  { V: { bg: '#F99B9B' } },
  { W: { bg: '#E7D3B6' } },
  { X: { bg: '#F6DC97' } },
  { Y: { bg: '#A89BF9' } },
  { Z: { bg: '#F99B9B' } },
];

export const alphabetsArray = ['All', ...Array.from({ length: 26 }, (_, index) => String.fromCharCode('A'.charCodeAt(0) + index))];



export const  getAllMonths = ()=> {
  const months = [];
  for (let i = 0; i < 12; i++) {
    months.push({ id: i + 1, title: new Date(2000, i).toLocaleString('default', { month: 'long' }) });
  }
  return months;
}



export const getAllYears =()=> {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 10;
  const endYear = currentYear;
  const years = [];

  for (let year = endYear; year >= startYear; year--) {
    years.push(year);
  }

  return years;
}

