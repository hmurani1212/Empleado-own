import useStore from "../../Store/Store";
import { getCareerOrgDisplayName } from "../../lib/utils";

interface VacancyServiceReturn {
  gettingAllVacanciesList: (statusFilter?: string, yearFilter?: string, monthFilter?: string) => Promise<void>;
  allVacanciesList: any[];
  /** Raw `org_name` from API (null if absent). */
  org_name: string | null;
  /** Resolved label: API name or "Veevo Tech". */
  careerOrgDisplayName: string;
  get_job_by_idfn: (id: string) => Promise<void>;
  job_details: any;
  get_apply_data: (vacancyId: string) => Promise<void>;
  apply_data: any;
  update_candidate: (data: any) => Promise<void>;
  submit_application: (applicationData: any) => Promise<void>;
}

const useVacancy = (): VacancyServiceReturn => {
  const gettingAllVacanciesList = useStore((state: any) => state.gettingAllVacanciesList);
  const allVacanciesList = useStore((state: any) => state.allVacanciesList);
  const org_name = useStore((state: any) => state.org_name);
  const get_job_by_idfn = useStore((state: any) => state.get_job_by_idfn);
  const job_details = useStore((state: any) => state.job_details);
  const get_apply_data = useStore((state: any) => state.get_apply_data);
  const apply_data = useStore((state: any) => state.apply_data);
  const update_candidate = useStore((state: any) => state.update_candidate);
  const submit_application = useStore((state: any) => state.submit_application);

  const careerOrgDisplayName = getCareerOrgDisplayName(org_name);

  return {
    gettingAllVacanciesList,
    allVacanciesList,
    org_name,
    careerOrgDisplayName,
    get_job_by_idfn,
    job_details,
    get_apply_data,
    apply_data,
    update_candidate,
    submit_application
  };
};

export default useVacancy;
