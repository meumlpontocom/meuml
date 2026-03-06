import React, { useState, useContext, useEffect } from "react";
import { CIcon } from "@coreui/icons-react";
import formatMoney from "../../../../../helpers/formatMoney";
import { PlanSignUpContext } from "../../../PlanSignUpContext";
import styled from "styled-components";

const PriceStyles = styled.div`
  display: inline-block;
  min-width: 70px;
  text-align: right;
`;

const SingleModule = ({ module, handleChange }) => {
  const { selectedPlan, selectedModules, setSelectedModules } = useContext(PlanSignUpContext);

  const [defaultChecked, setDefaultChecked] = useState(module.selected);
  const [isChecked, setIsChecked] = useState(selectedModules.some(({ id }) => module.id === id));
  const [seeMore, setSeeMore] = useState(false);

  useEffect(() => {
    setIsChecked(selectedModules.some(({ id }) => module.id === id));
    setDefaultChecked(selectedPlan?.modules_ids?.includes(module.id));
  }, [selectedPlan, setSelectedModules, module, selectedModules]);

  function handleClick() {
    setIsChecked(!isChecked);
  }
  return (
    <>
      <div className="accordion">
        <div className="form-check mb-1">
          <input
            className="form-check-input"
            type="checkbox"
            name="PlanOptions"
            id={module.id}
            value={module.title}
            data-platform={module.platform}
            onChange={handleChange}
            onClick={handleClick}
            checked={isChecked}
            disabled={defaultChecked}
          />
          <label className="form-check-label" htmlFor={module.id}>
            <div>
              <CIcon name="cilCheck" className="mr-3" />
              {module.title}
            </div>
            <div>
              <span className="ml-3">
                <button
                  onClick={() => setSeeMore(prev => !prev)}
                  data-toggle="collapse"
                  data-target={`#collapse${module.id}`}
                >
                  <span>ver mais</span>
                  <i className="cil-caret-bottom ml-1" />
                </button>
              </span>
              <PriceStyles className="ml-3 price">
                {selectedPlan?.modules_ids?.includes(module.id) ? "Incluído" : formatMoney(module.price)}
              </PriceStyles>
            </div>
          </label>
        </div>
        <div id={`collapse${module.id}`} className="collapse" dataparent="#accordion">
          <p className="px-4">{module.tools}</p>
        </div>
      </div>
      {seeMore && (
        <div className="accordion">
          <div className="form-check mb-1">
            <label onClick={() => setSeeMore(false)} className="form-check-label">
              <div>{module.tools}</div>
            </label>
          </div>
        </div>
      )}
    </>
  );
};

export default SingleModule;
