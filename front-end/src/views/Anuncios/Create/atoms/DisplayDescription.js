import React, { useContext }     from "react";
import { CCardBody }             from "@coreui/react";
import { createMlAdvertContext } from "../createMlAdvertContext";

const DisplayDescription = () => {
  const { form } = useContext(createMlAdvertContext);
  return (
    <CCardBody>
      <section id="description">
        <h4 className="text-primary">Descrição</h4>
        <h5
          className="card-text"
          dangerouslySetInnerHTML={{
            __html: form.description.replace(/\n/g, "<br/>"),
          }}
        />
      </section>
    </CCardBody>
  );
};

export default DisplayDescription;
