import { Input, Button, Typography } from "@material-tailwind/react";
import React, { useEffect, useState, useMemo } from "react";
import useBranches from "../../ViewModel/BranchesViewModel/BranchesServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import branchesApi from "../../Model/Data/Branches/Branches";
import { editBranchFormValidaion } from "../../Validation/Validation";
import { showToast } from "../../Components/Toaster/Toaster";
import BranchesServices2 from "../../ViewModel/Brach2ViewModel/BranchesServices2";
import useStore from "../../Store/store";
import useBranches2 from '../../ViewModel/Brach2ViewModel/BranchesServices2';

function EditBranchForm(props) {
  const { data, branchID } = props;
  const { allCountries } = useBranches();
  const { handleEditBranch } = useBranches2();
  const closeDrawer = useStore((state) => state.closeDrawer);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    handleBranchTimeZone(data.country_id);
  }, []);
  
  const [newBranchValues, setNewBranchValues] = useState({
    branch_name: data?.branch_name || "",
    branch_address: data?.address || "",
    phone_no: data?.phone_no || "",
    email_address: data?.email_add || "",
    country_code: data?.country_id || "",
    currency: data?.currency || "",
    time_zone: data?.time_zone || ""
  });

  const isFormValid = useMemo(() => {
    return (
      newBranchValues.branch_name?.trim() !== '' &&
      newBranchValues.branch_address?.trim() !== '' &&
      newBranchValues.phone_no?.trim() !== '' &&
      newBranchValues.email_address?.trim() !== '' &&
      newBranchValues.country_code &&
      newBranchValues.currency?.trim() !== ''
    );
  }, [newBranchValues]);

  const handleNewBranch = (e) => {
    const { name, value } = e.target;
    setNewBranchValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelect = (selectedOption, field) => {
    const fieldValue = selectedOption.value || selectedOption;
    handleBranchTimeZone(selectedOption.value);

    if (field === "country_code") {
      const selectedCountry = allCountries.find(
        (country) => country.id === fieldValue
      );
      const currency = selectedCountry ? selectedCountry.currency : "";
      const timeZone = selectedCountry ? selectedCountry.zone_name : "";
      setNewBranchValues((prevState) => ({
        ...prevState,
        [field]: fieldValue,
        currency: currency,
        time_zone: timeZone,
      }));
    } else {
      setNewBranchValues((prevState) => ({
        ...prevState,
        [field]: fieldValue,
      }));
    }
  };

  const [timeZoneData, setTimeZoneData] = useState([]);
  const handleBranchTimeZone = async (id) => {
    const data = { id: id };
    try {
      const response = await branchesApi.getBranchTimeZone(data);
      const respTimeZoneData = await response.data;

      if (response.status === 200 && respTimeZoneData.STATUS === "SUCCESSFUL") {
        setTimeZoneData(respTimeZoneData.TIME_ZONE);
        const timeZone = respTimeZoneData.TIME_ZONE[0]?.zone_name || "";
        setNewBranchValues((prevState) => ({
          ...prevState,
          time_zone: timeZone,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formatPhoneNumber = (name, value) => {
    if (name === "phone_no") {
      if (value.startsWith("0")) {
        return "+92" + value.slice(1);
      } else if (!value.startsWith("+")) {
        return "+92" + value;
      }
    }
    return value;
  };

  const updtae_branch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const editData = {
      id: branchID,
      branch_name: newBranchValues.branch_name,
      branch_address: newBranchValues.branch_address,
      phone_no: newBranchValues.phone_no,
      email_address: newBranchValues.email_address,
      country_id: newBranchValues.country_code,
      currency: newBranchValues.currency,
      time_zone: newBranchValues.time_zone
    };
    
    try {
      await handleEditBranch(editData);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='p-6'>
      <form className='flex flex-col gap-6' onSubmit={updtae_branch}>
        <div className="grid grid-cols-1 gap-6">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                Branch Name <span className="text-red-500">*</span>
              </Typography>
              <Input
                size="lg"
                placeholder="e.g. Head Office"
                className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={newBranchValues.branch_name}
                name="branch_name"
                onChange={handleNewBranch}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                Branch Address <span className="text-red-500">*</span>
              </Typography>
              <Input
                size="lg"
                placeholder="e.g. 123 Main St, City, Country"
                className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={newBranchValues.branch_address}
                name="branch_address"
                onChange={handleNewBranch}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                    Phone Number <span className="text-red-500">*</span>
                  </Typography>
                  <Input
                    size="lg"
                    placeholder="e.g. +1 234 567 8900"
                    className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    value={formatPhoneNumber("phone_no", newBranchValues.phone_no)}
                    name="phone_no"
                    onChange={handleNewBranch}
                  />
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                    Email Address <span className="text-red-500">*</span>
                  </Typography>
                  <Input
                    size="lg"
                    type="email"
                    placeholder="e.g. branch@company.com"
                    className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    value={newBranchValues.email_address}
                    name="email_address"
                    onChange={handleNewBranch}
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                    Country <span className="text-red-500">*</span>
                  </Typography>
                  <CustomSelect
                    placeHolderTitle="Country"
                    value={
                      allCountries?.find(
                        (country) => country.id === newBranchValues.country_code
                      )
                        ? {
                          value: `${newBranchValues.country_code}`,
                          label: allCountries.find(
                            (country) =>
                              country.id === newBranchValues.country_code
                          ).country_name,
                        }
                        : newBranchValues.country_code
                    }
                    options={allCountries?.map((country) => ({
                      value: `${country.id}`,
                      label: country.country_name,
                    }))}
                    onChangeHandler={(selectedOption) =>
                      handleSelect(selectedOption, "country_code")
                    }
                    customStyle={false}
                  />
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                    Currency <span className="text-red-500">*</span>
                  </Typography>
                  <Input
                    size="lg"
                    placeholder="e.g. USD"
                    className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    value={newBranchValues.currency}
                    name='currency'
                    onChange={handleNewBranch}
                    readOnly
                  />
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
           <Button
              variant="text"
              color="gray"
              onClick={closeDrawer}
              className="font-poppins normal-case cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className={`font-poppins normal-case px-6 cursor-pointer ${isFormValid ? 'bg-bgBlue shadow-blue-500/20' : 'bg-blue-200 shadow-none'}`}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Branch'}
            </Button>
        </div>
      </form>
    </div>
  );
}

export default EditBranchForm;