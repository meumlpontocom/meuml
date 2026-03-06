import React, { useContext } from "react";
import styled from "styled-components";

import SinglePlan from "./SinglePlan";
import { PlanSignUpContext } from "../../../PlanSignUpContext";

const PlanOptionStyles = styled.div`
  margin-left: -18px;
  svg polygon {
    fill: #fff;
  }
  .form-check input {
    visibility: hidden;
  }
  .form-check label {
    display: flex;
    justify-content: space-around;
    align-items: center;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    line-height: 1;
    background-color: #fff;
    padding: 12px;
    border: 1px solid #ebedef;
    border-radius: 0.25rem;
  }

  .form-check label:hover {
    border-color: #321fdb;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 21, 0.15);
  }

  .form-check input:checked ~ label {
    color: #fff;
    background-color: #321fdb;
  }
`;

const PlansList = () => {
  const {
    selectedPlan,
    availablePlans,
    setSelectedPlan,
    selectedModules,
    setSelectedModules,
  } = useContext(PlanSignUpContext);

  function handleChange(e) {
    const id = e.target.id;
    const plan = availablePlans.filter((plan) => plan.id === id)[0];
    setSelectedPlan(plan);
    // reset selected modules that are from ML
    setSelectedModules([
      ...selectedModules.filter(({ platform }) => platform !== "ML"),
    ]);
  }

  return (
    <>
      <PlanOptionStyles>
        {availablePlans.map((plan) => (
          <SinglePlan
            key={plan.id + plan.name.toLowerCase()}
            handleChange={handleChange}
            planName={plan.name}
            planId={plan.id}
            planSelected={selectedPlan.id === plan.id}
          />
        ))}
      </PlanOptionStyles>
    </>
  );
};

export default PlansList;
