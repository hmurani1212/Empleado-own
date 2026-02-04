import React from 'react';
import { Outlet } from 'react-router-dom';

const Expense = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default Expense;
