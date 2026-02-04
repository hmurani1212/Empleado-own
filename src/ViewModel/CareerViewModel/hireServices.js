import { useState, useCallback, useRef } from "react";
import hire_apis from "../../Model/Data/CareerPae/hire_apis";

const useHireDate = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [jobData, setJobData] = useState(null);
    const [cities, setCities] = useState([]);
    const [countries, setCountries] = useState([]);

    // Cache refs
    const jobsCache = useRef(new Map()); // Change to Map to store by org_id
    const jobDetailsCache = useRef(new Map());
    const lastFetchTime = useRef(new Map()); // Change to Map to store by org_id
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const isCacheValid = (org_id) => {
        if (!lastFetchTime.current.has(org_id)) return false;
        return Date.now() - lastFetchTime.current.get(org_id) < CACHE_DURATION;
    };

    const get_jobs = useCallback(async (org_id) => {
        if (!org_id) {
            throw new Error('Organization ID is required');
        }

        try {
            // Return cached data if valid
            if (jobsCache.current.has(org_id) && isCacheValid(org_id)) {
                return jobsCache.current.get(org_id);
            }

            setLoading(true);
            setError(null);
            const response = await hire_apis.get_jobs(org_id);

            // Cache the response
            jobsCache.current.set(org_id, response.data);
            lastFetchTime.current.set(org_id, Date.now());

            return response.data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const get_job_by_id = useCallback(async (id) => {
        try {
            // Check cache first
            if (jobDetailsCache.current.has(id)) {
                const cachedData = jobDetailsCache.current.get(id);
                if (Date.now() - cachedData.timestamp < CACHE_DURATION) {
                    return cachedData.data;
                }
            }

            setLoading(true);
            setError(null);
            const response = await hire_apis.get_jobs_by_id(id);
            setJobData(response.data);

            // Cache the response
            jobDetailsCache.current.set(id, {
                data: response.data,
                timestamp: Date.now()
            });

            return response.data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const get_vacancy_apply_data = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            const response = await hire_apis.get_vacancy_apply_data(id);
            return response.data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const submit_application = useCallback(async (applicationData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await hire_apis.submit_application(applicationData);
            return response.data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const create_candidate = useCallback(async (formData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await hire_apis.create_candidate(formData);
            return response.data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const update_candidate = useCallback(async (formData) => {
        try {
            setLoading(true);
            setError(null);
            const response = await hire_apis.update_candidate(formData);
            return response.data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const get_candidate_profile = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await hire_apis.get_candidate_profile();
            return response.data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const citiesCache = useRef(null);
    const citiesLastFetch = useRef(null);

    const get_cities = useCallback(async () => {
        try {
            // Return cached cities if valid
            if (citiesCache.current && citiesLastFetch.current &&
                (Date.now() - citiesLastFetch.current < CACHE_DURATION)) {
                setCities(citiesCache.current);
                return { DB_DATA: citiesCache.current };
            }

            setLoading(true);
            setError(null);
            const response = await hire_apis.get_cities();

            // Cache the cities
            citiesCache.current = response.data.DB_DATA;
            citiesLastFetch.current = Date.now();

            setCities(response.data.DB_DATA);
            return response.data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    const countriesCache = useRef(null);
    const countriesLastFetch = useRef(null);

    const get_countries = useCallback(async () => {
        try {
            // Return cached countries if valid
            if (countriesCache.current && countriesLastFetch.current &&
                (Date.now() - countriesLastFetch.current < CACHE_DURATION)) {
                setCountries(countriesCache.current);
                return countriesCache.current;
            }

            setLoading(true);
            setError(null);
            const response = await hire_apis.get_countries();

            // Cache the countries
            countriesCache.current = response.data;
            countriesLastFetch.current = Date.now();

            setCountries(response.data);
            return response.data;
        } catch (error) {
            setError(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update clearCache to handle Maps
    const clearCache = useCallback(() => {
        jobsCache.current.clear();
        jobDetailsCache.current.clear();
        lastFetchTime.current.clear();
        citiesCache.current = null;
        countriesCache.current = null;
        citiesLastFetch.current = null;
        countriesLastFetch.current = null;
    }, []);

    return {
        loading,
        error,
        jobData,
        cities,
        countries,
        get_jobs,
        get_job_by_id,
        get_vacancy_apply_data,
        submit_application,
        create_candidate,
        update_candidate,
        get_candidate_profile,
        get_cities,
        get_countries,
        clearCache
    };
};

export default useHireDate;
