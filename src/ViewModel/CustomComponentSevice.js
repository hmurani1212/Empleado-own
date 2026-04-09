import { STANDARD_APP_SIDE_DRAWER } from '../utils/drawerSizeUtils'

const CustomComponentService = (set, get)=>({
    drawerOpen: false, 
    childComponent: '',
    drawerTitle: '',
    drawerSize: STANDARD_APP_SIDE_DRAWER,
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

    /** All store-driven side drawers use one width; call-site values are ignored for consistency */
    settingDrawerSize: () => {
        set({ drawerSize: STANDARD_APP_SIDE_DRAWER })
    }
})


export default CustomComponentService