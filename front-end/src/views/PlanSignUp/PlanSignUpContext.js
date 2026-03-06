import React, { useState, createContext } from "react";

export const PlanSignUpContext = createContext();

export const PlanSignUpProvider = (props) => {
  const [allSelectedAccounts, setAllSelectedAccounts] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState({});
  const [availableModules, setAvailableModules] = useState({});
  const [selectedModules, setSelectedModules] = useState([]);
  const [discountMultipliers, setDiscountMultipliers] = useState([]);

  return (
    <PlanSignUpContext.Provider
      value={{
        allSelectedAccounts,
        setAllSelectedAccounts,
        selectedPlan,
        setSelectedPlan,
        availablePlans,
        setAvailablePlans,
        availableModules,
        setAvailableModules,
        selectedModules,
        setSelectedModules,
        discountMultipliers,
        setDiscountMultipliers,
      }}
    >
      {props.children}
    </PlanSignUpContext.Provider>
  );
};
