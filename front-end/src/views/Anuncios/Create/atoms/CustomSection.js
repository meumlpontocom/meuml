import React from "react";

const CustomSection = ({ header = "", id, children }) => {
  return (
    <>
      <section id={id} className="mt-4 mb-4">
        {header && <h4 className="text-primary">{header}</h4>}
        {children}
      </section>
    </>
  );
};

export default CustomSection;
