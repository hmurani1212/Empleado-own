import React, { useEffect } from 'react';
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices"
import { formatTimestamp } from "../Branches/utils";
// //  get_inactive_empfn,
//         get_inactive_emp_data
const InactiveEmployeesDetails = () => {

  const { get_inactive_empfn, get_inactive_emp_data } = useEmployees();
  useEffect(() => {
    get_inactive_empfn();
  }, [get_inactive_empfn]);
  // ['Name', 'Designation', 'Leaving Reason', 'Leaving Date']

  // const table_head = [
  //   {
  //     id: 1,
  //     Name: 'Name'
  //   },
  //   {
  //     id: 2,
  //     Name: 'Designation'
  //   },
  //   {
  //     id: 3,
  //     Name: 'Leaving Reason'
  //   },
  //   {
  //     id: 4,
  //     Name: 'Leaving Date'
  //   },
  // ]

  // console.log('get_inactive_emp_data',  get_inactive_emp_data)
  return (
    <div className="">


      <div class="relative overflow-x-auto">
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-6 py-3">
                name
              </th>
              <th scope="col" class="px-6 py-3">
                Designation
              </th>
              <th scope="col" class="px-6 py-3">
                Leaving Reason
              </th>
              <th scope="col" class="px-6 py-3">
                Leaving Date
              </th>
            </tr>
          </thead>
          <tbody>
            {get_inactive_emp_data?.map((data, index) => {
              return <>

                <tr key={index} class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                  <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {data?.name}
                  </th>
                  <td class="px-6 py-4">
                    {data?.designationObj?.title}
                  </td>
                  <td class="px-6 py-4">
                    {data?.leave_reason}
                  </td>
                  <td class="px-6 py-4">
                    {formatTimestamp(data?.leave_date).split(',')[0]}{","}{formatTimestamp(data?.leave_date).split(',')[1]}
                  </td>
                </tr>

              </>
            })}

          </tbody>
        </table>
      </div>


    </div>
  );
};

export default InactiveEmployeesDetails;

