import React, { useState } from "react";
import "./style.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Accordion = ({ header, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="accordion-container">
      <div className="accordion-header" onClick={toggleAccordion}>
        {header}
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      <div className={`accordion-content ${isOpen ? "open" : ""}`}>{children}</div>
    </div>
  );
};

export default Accordion;
