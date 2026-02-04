import { Input, Button } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
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
  const { allCountries, handleEditBranch } = useBranches();
  const {gettingAllBranchesNew, markBranchAdmin} = useBranches2()
  // console.log("allCountriesallCountries", allCountries)
  const closeDrawer = useStore((state) => state.closeDrawer);
  // const gettingAllBranchesNew = useStore((state) => state.gettingAllBranchesNew);
  const [isLoading, setIsLoading] = useState(false);
  const { branchesAllNew } = BranchesServices2();
  // console.log('branch name', newBranchValues)
  // console.log('selected country', selectedCountry)

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
  });

  const handleNewBranch = (e) => {
    const { name, value } = e.target;
    // console.log("name, value", name, value);

    setNewBranchValues((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelect = (selectedOption, field) => {
    const fieldValue = selectedOption.value || selectedOption;
    // console.log("selectedOption", selectedOption);
    handleBranchTimeZone(selectedOption.value);

    if (field === "country_code") {
      const selectedCountry = allCountries.find(
        (country) => country.id === fieldValue
      );
      const currency = selectedCountry ? selectedCountry.currency : "";
      const timeZone = selectedCountry ? selectedCountry.zone_name : "";
      // console.log("timeZone", timeZone);
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
    // console.log("id", id);

    try {
      const response = await branchesApi.getBranchTimeZone(data);

      const respTimeZoneData = await response.data;
      // console.log("time zone", respTimeZoneData);

      if (response.status === 200 && respTimeZoneData.STATUS === "SUCCESSFUL") {
        setTimeZoneData(respTimeZoneData.TIME_ZONE);
        const timeZone = respTimeZoneData.TIME_ZONE[0]?.zone_name || "";
        setNewBranchValues((prevState) => ({
          ...prevState,
          time_zone: timeZone,
        }));
        // setTimeZoneData(data.TIME_ZONE)
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
    // gettingAllBranchesNew();
    const editData = {
      id: branchID,
      branch_name: newBranchValues.branch_name,
      branch_address: newBranchValues.branch_address,
      phone_no: newBranchValues.phone_no,
      email_address: newBranchValues.email_address,
      country_id: newBranchValues.country_code,
      currency: newBranchValues.currency,
    };
    handleEditBranch(editData)
  }

  // const handleEditBranch = async (e) => {
  //   e.preventDefault();

  //   const editData = {
  //     id: branchID,
  //     branch_name: newBranchValues.branch_name,
  //     branch_address: newBranchValues.branch_address,
  //     phone_no: newBranchValues.phone_no,
  //     email_address: newBranchValues.email_address,
  //     country_id: newBranchValues.country_code,
  //     currency: newBranchValues.currency,
  //   };

  //   try {
  //     await validateEditData(editData);
  //     setIsLoading(true);
  //     const response = await branchesApi.editBranch(editData);
  //     const respEditData = await response.data;

  //     if (respEditData.STATUS === "SUCCESSFUL") {
  //       // Refresh the branches list to get latest data
  //       await gettingAllBranchesNew({ page: 1 });

  //       showToast("Branch updated successfully", "success");
  //       closeDrawer();
  //     } else {
  //       showToast("Failed to update branch", "error");
  //       // closeDrawer();
  //     }
  //   } catch (error) {
  //     console.error("Error updating branch:", error);
  //     showToast(error?.message || "Failed to update branch", "error");
  //     closeDrawer();
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const validateEditData = async (formData) => {
  //   const fields = Object.keys(formData);

  //   for (const field of fields) {
  //     try {
  //       await editBranchFormValidaion.validateAt(field, formData);
  //     } catch (error) {
  //       throw error;
  //     }
  //   }
  // };

  return (
    <>
      <div className="w-90">
        <form className="" onSubmit={updtae_branch}>
          <div className="flex flex-col gap-4">
            <div>
              <Input
                required
                label="Enter Branch Name*"
                value={newBranchValues.branch_name}
                name="branch_name"
                onChange={handleNewBranch}
              />
            </div>
            <div>
              <Input
                required
                label="Enter Branch Address*"
                value={newBranchValues.branch_address}
                name="branch_address"
                onChange={handleNewBranch}
              />
            </div>

            <div>
              <Input
                required
                label="Enter Phone No*"
                value={formatPhoneNumber("phone_no", newBranchValues.phone_no)}
                name="phone_no"
                onChange={handleNewBranch}
              />
            </div>

            <div>
              <Input
                required
                label="Enter Email Address*"
                value={newBranchValues.email_address}
                name="email_address"
                onChange={handleNewBranch}
              />
            </div>

            <div>
              <label className="text-[#7a929e]">Select Country*</label>

              <CustomSelect
                required
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
              <Input
                required
                label="Enter Currency*"
                value={newBranchValues.currency}
                onChange={handleNewBranch}
              />
            </div>


            <div>
              {isLoading ? (
                <Button
                  className="bg-blue-300 py-[10px] capitalize"
                  loading={true}
                >
                  Loading
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-blue-300 py-[10px] capitalize"
                >
                  Submit
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default EditBranchForm;
