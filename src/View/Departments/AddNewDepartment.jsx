import {
  Checkbox,
  Input,
  Option,
  Radio,
  Select,
  Textarea,
} from "@material-tailwind/react";
import React, { useEffect } from "react";
import { MdAddBox, MdCancel } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";
import useDepartments from "../../ViewModel/DepartmentsViewModel/DepartmentsServices";

function AddNewDepartment() {
  const { allBranches, dep_data, getBranchEmployeeList } = useDepartments();
  // console.log("allBranches", allBranches);
  
  useEffect(() => {
    // Fetch branches when component mounts
    if (!allBranches || allBranches.length === 0) {
      getBranchEmployeeList();
    }
  }, []);
  
  // console.log("dep_datadep_data", dep_data);
  return (
    <form>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <form>
          <div className="relative flex-col ">
            <span className="text-[15px] font-semibold">
              Add New Department
            </span>
            <div className="my-4">
              <label className="text-[13px]">
                Choose your branch office from the list below
              </label>
              <div className="mt-2">
                <Select label="Choose Branch Office" className="h-9">
                  {allBranches?.map((ele) => (
                    <Option value={ele} key={ele.id}>
                      {ele?.branch_name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="my-4">
              <span className="text-[15px] font-semibold">
                Department Visibility Privacy
              </span>
              <div className="flex text-[13px]">
                <Radio
                  name="color"
                  color="blue"
                  label="For the selected branch only"
                />
                <Radio
                  name="color"
                  color="blue"
                  label="Global (for all branches)"
                  className="text-[13px]"
                  defaultChecked
                />
              </div>
            </div>

            <div className="my-4">
              <span className="text-[15px] font-semibold">Description</span>
              <div className="w-96 mt-2">
                <Textarea label="Enter Description" />
              </div>
            </div>
            <div className="my-4">
              <span className="text-[15px] font-semibold">Designation(s)</span>
              <div className="text-[13px]">
                <Checkbox label="Team Leader" />
                <Checkbox label="Manager" />
                <Checkbox label="Assistant Manager" />
                <Checkbox label="Director" />
                <Checkbox label="Coordinator" />
              </div>
            </div>
            <div className="my-4">
              <span className="text-[15px] font-semibold">
                Head of Department
              </span>
              <div className="mt-2">
                <Select label="Select Head of Department">
                  <Option value="dept">Select Head of Department</Option>
                </Select>
              </div>
            </div>
            <div className="my-4">
              <span className="text-[15px] font-semibold">Management</span>
              <div className="flex my-3">
                <FaCheck className="text-[20px] text-[#3DA5F4] mx-[2px]" />
                <span className="text-[15px] mx-4">Team Leader</span>
                <MdCancel className="text-[20px] text-[#FF4979] ml-5" />
              </div>
              <div className="flex my-3">
                <FaCheck className="text-[20px] text-[#3DA5F4] mx-[2px]" />
                <span className="text-[15px] mx-4">Team Leader</span>
                <MdCancel className="text-[20px] text-[#FF4979] ml-5" />
              </div>
            </div>
            <div className="my-4">
              <span className="text-[15px] font-semibold">
                Head of Department
              </span>
              <div className="text-[13px]">John</div>
              <div className="text-[13px]">Khan</div>
            </div>
            <button
              type="submit"
              className="px-[15px] py-[6px] bg-[#F4FAFF] rounded-lg text-[#3DA5F4]"
            >
              Save
            </button>
          </div>
        </form>

        {/* Existing Department */}
        <div className="relative flex-col">
          <span className="text-[15px] font-semibold">
            Existing Departments
          </span>
          <div className="my-4 text-[13px]">
            <div className="px-[20px] py-[13px] bg-gray-200 rounded-lg my-2">
              Management
            </div>
            <div className="px-[20px] py-[13px] bg-gray-200 rounded-lg my-2">
              Administration
            </div>
            <div className="px-[20px] py-[13px] bg-gray-200 rounded-lg my-2">
              Technical
            </div>
            <div className="px-[20px] py-[13px] bg-gray-200 rounded-lg my-2">
              Mobile Application
            </div>
            <div className="px-[20px] py-[13px] bg-gray-200 rounded-lg my-2">
              Marketing & Sales
            </div>
            <div className="px-[20px] py-[13px] bg-gray-200 rounded-lg my-2">
              IOT
            </div>

            <button className="py-[10px] px-[20px] bg-gray-200 rounded-lg border border-black">
              Add Another Department
            </button>
          </div>

          <div className="my-4">
            <span className="text-[15px] font-semibold">Department Name</span>
            <div className="my-4">
              <Input label="Enter Department Name" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-[15px] font-semibold">Description</span>
            <div className="w-96 mt-2">
              <Textarea label="Enter Description" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-[15px] font-semibold">Designations</span>
            <div className="my-4 flex">
              <Input label="Enter Designations" />
              <MdAddBox className="text-[40px] text-[#3DA5F4]" />
            </div>
          </div>
          <div className="my-4">
            <span className="text-[15px] font-semibold">
              Head of Department
            </span>
            <div className="my-4 flex">
              <Select label="Select Head of Department">
                <Option value="head">Select Head of Department</Option>
              </Select>
              <MdAddBox className="text-[40px] text-[#3DA5F4]" />
            </div>
          </div>

          <button className="px-[15px] py-[6px] bg-[#F4FAFF] rounded-lg text-[#3DA5F4]">
            Save
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddNewDepartment;
