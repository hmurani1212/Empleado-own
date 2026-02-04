const CustomComponentService = (set, get)=>({
    drawerOpen: false, 
    childComponent: '',
    drawerTitle: '',
    drawerSize:'',
    closeDrawer:()=>{
        set({drawerOpen: false})
    },
    openDrawer:()=>{
        set({drawerOpen: true})
    },
    settingComponent:(compo)=>{
        set({childComponent:compo})
    },
    settingDrawerTitle:(title)=>{
        set({drawerTitle: title})
    },

    settingDrawerSize:(size)=>{
        set({drawerSize:size})
    }
})


export default CustomComponentService