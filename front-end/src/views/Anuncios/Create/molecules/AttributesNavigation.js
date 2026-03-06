import React, { useCallback } from "react";
import { Nav }                from "../atoms";
import PropTypes              from "prop-types";
import { CRow }               from "@coreui/react";
import AttributeTab           from "../molecules/AttributeTab";

const AttributesNavigation = ({ tabs, navCallback, handleFormInputChange }) => {
  const callback = useCallback(tabIndex => navCallback(tabIndex), [navCallback]);
  return (
    <>
      <Nav callback={callback} />
      <CRow>
        {tabs.map(tab => {
          return (
            <AttributeTab
              key={tab.id}
              isActive={tab.isActive}
              content={tab.content}
              handleInputChange={handleFormInputChange}
            />
          );
        })}
      </CRow>
    </>
  );
};

AttributesNavigation.propTypes = {
  tabs: PropTypes.array.isRequired,
  navCallback: PropTypes.func.isRequired,
};

export default AttributesNavigation;
