import React from "react";
import { CFooter, CLink } from "@coreui/react";

const TheFooter = () => {
  return (
    <CFooter fixed={false}>
      <div>
        <span>&copy; 2020 MeuML.com</span>
      </div>
      <div className="mfs-auto">
        <span className="mr-1">suporte@meuml.com</span>
        <CLink
          href="https://wa.me/554191230100"
          target="_blank"
          rel="noopener noreferrer"
          className="text-info"
        >
          +55 (41)99123-0100
        </CLink>
      </div>
    </CFooter>
  );
};

export default React.memo(TheFooter);
