const drawerServices = (set, get)=>({
    drawerShow: false,
    drawerComponent: '',
    drawerPlacement: '',

    handleDrawerOpen: ()=>{
        set({drawerShow: true})
    },

    handleDrawerClose: ()=>{
        set({drawerShow: false})
    },
    settingComponent: (data)=>{
        set({drawerComponent: data})
    },
    settingPlacement: (data)=>{
        set({drawerPlacement: data})
    }
    
    
})
export default drawerServices