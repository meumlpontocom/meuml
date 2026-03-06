import React, { useEffect, useContext } from "react";
import { PlanSignUpContext } from "../../PlanSignUpContext";
import styled from "styled-components";
import SingleModule from "./SingleModule";

const PlanModulesStyles = styled.div`
  margin-left: -18px;
  margin-bottom: 5px;

  button {
    color: inherit;
    font-family: inherit;
    font-size: 12px;
    border: none;
    border-radius: 0.25rem;
    background: transparent;
  }

  button i {
    font-size: 8px;
    text-decoration: none;
  }

  button:hover > span {
    text-decoration: underline;
  }

  button:focus,
  button:active {
    outline: none;
    box-shadow: 0 0 0 0.2rem rgb(50 31 219 / 25%);
  }

  .form-check input {
    visibility: hidden;
  }

  .form-check label {
    min-width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-size: 16px;
    background-color: #fff;
    padding: 0 12px;
    border-radius: 0.25rem 0 0 0.25rem;
    border: 1px solid #ebedef;
    border-radius: 0.25rem;
  }

  .form-check {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 16px;
    background-color: #fff;
  }

  .form-check label:hover {
    border-color: #321fdb;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 21, 0.15);
  }

  .form-check .spec {
    padding: 12px;
  }

  .form-check input:checked ~ label {
    color: #fff;
    background-color: #321fdb;
  }

  .form-check input:disabled ~ label {
    color: #4f5d73;
    cursor: default;
    background-color: hsla(246, 75%, 49%, 0.1);
  }
  .form-check input:disabled ~ label:hover {
    border: 1px solid #768192;
    box-shadow: none;
  }

  .form-check input:checked ~ label:hover {
    box-shadow: none;
  }

  .form-check input:checked ~ label button {
    color: #fff;
  }
  .form-check input:disabled ~ label button {
    color: #4f5d73;
  }
`;

const ModulesList = ({ platform }) => {
  const { availablePlans, availableModules, setSelectedModules, selectedModules, setSelectedPlan } =
    useContext(PlanSignUpContext);

  function handleChangeCheckBox(e) {
    const id = parseInt(e.currentTarget.id);
    const clickedModule = {
      ...availableModules.find(module => module.id === id),
    };
    clickedModule.selected = e.currentTarget.checked;
    if (e.currentTarget.checked) {
      setSelectedModules([...selectedModules, clickedModule]);
    }
    if (!e.currentTarget.checked) {
      setSelectedModules(selectedModules.filter(module => module.id !== id));
    }
  }

  useEffect(() => {
    // check if user selected all paid modules from ML
    // if its true, change the plan from gratuito to profissional
    function shouldChangeToProPlan() {
      const paidModulesML = availableModules.filter(({ platform, price }) => platform === "ML" && price > 0);
      const selectedModulesML = selectedModules.filter(({ platform }) => platform === "ML");

      return (
        selectedModulesML.length === paidModulesML.length &&
        paidModulesML.map(({ id }) => id).join("") === selectedModulesML.map(({ id }) => id).join("")
      );
    }

    if (shouldChangeToProPlan()) {
      const proPlan = availablePlans.filter(({ name }) => name === "Profissional")[0];
      setSelectedPlan(proPlan);
      // reset selected modules that are from ML
      setSelectedModules([...selectedModules.filter(({ platform }) => platform !== "ML")]);
    }
  }, [selectedModules, availableModules, availablePlans, setSelectedPlan, setSelectedModules]);

  return (
    <>
      <PlanModulesStyles>
        {availableModules
          .filter(module => module.platform === platform)
          .map(module => (
            <SingleModule
              key={module.id + module.title + module.platform}
              module={module}
              handleChange={handleChangeCheckBox}
            />
          ))}
      </PlanModulesStyles>
    </>
  );
};

export default ModulesList;
