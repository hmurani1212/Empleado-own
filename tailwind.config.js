const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = withMT({
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'], // Adding Inter for body text if needed
      },
      colors: {
        // Brand Colors
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#3DA5F4', // Original Brand Color
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Semantic Colors
        primary: '#3DA5F4', 
        secondary: '#68BAA8',
        danger: '#F55E67',
        warning: '#FFC107',
        success: '#0acf97',
        
        // Neutral Colors (for text/bg)
        surface: '#ffffff',
        background: '#f3f4f6', // Light gray background
        
        // Legacy Mappings (keeping them for compatibility)
        customBlue: '#3DA5F4',
        blueCustom:{
          100:'#0185EA'
        },
        Red: '#F55E67', 
        customRed:{
          100:'#fc563b'
        },
        // primary:{ // This was conflicting/limited, mapped to brand colors above if needed, but keeping for legacy
        //   100: '#8bc9f8'
        // },
        customBlack:{
          100:'#474747'
        },
        customGray:{
          100:'#9b9b9b',
          200:'#f8f9fa',
          300:'#dee2e6',
          400:'#545a5c',
          500:'#989898',
          blueGray:'#6691cc'
        },
        customGreen:{
          100:'#68BAA8',
          200:'#0acf97'
        },
        customPurple:{
          500:'#8770FF'
        },
        customOrange:{
          300:'#FDB775',
          400:'#ee963c'
        },
        customYellow:{
          100:'#FFC107'
        },
        bgBlue: "#3DA5F4"
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 0 0 1px rgba(0,0,0,0.03), 0 8px 16px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
})


