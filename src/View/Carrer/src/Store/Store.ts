import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import AllVacancyApis from "../viewModel/VacancyViewModel/Vaccancy";

interface StoreState {
  allVacanciesList: any[];
  org_name: string | null;
  job_details: any;
  apply_data: any;
  gettingAllVacanciesList: (statusFilter?: string, yearFilter?: string, monthFilter?: string) => Promise<void>;
  get_job_by_idfn: (id: string) => Promise<void>;
  get_apply_data: (vacancyId: string) => Promise<void>;
  update_candidate: (data: any) => Promise<void>;
  submit_application: (applicationData: any) => Promise<void>;
}

const useStore = create<StoreState>()(
  devtools((set, get) => ({
    ...AllVacancyApis(set, get),
  }))
);

export default useStore;