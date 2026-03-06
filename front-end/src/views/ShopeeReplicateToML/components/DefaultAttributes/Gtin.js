import React, { useContext, useEffect, useState } from "react";
import Container from "./Container";
import { CInput, CLabel } from "@coreui/react";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";

const Gtin = ({ handleFormChange, updateFormValue }) => {
  const { form } = useContext(shopeeReplicateToMLContext);

  const adOriginalGtin = form.basic.original_ad_gtin;
  const isOriginalGtinValid = !!adOriginalGtin;
  const gtinValueReferenceOnScreen = isOriginalGtinValid ? adOriginalGtin : "Anúncio original sem GTIN";

  const gtinBehaviourDefaultValue = form.basic.gtin_behavior ?? "keep-original-gtin";
  const validGtinBehaviour = isOriginalGtinValid ? gtinBehaviourDefaultValue : "no-gtin";
  const [gtinBehavior, setGtinBehavior] = useState(validGtinBehaviour);

  function handleChangeGtinBehavior(value) {
    setGtinBehavior(value);

    const gtinBehaviorFormValue = {
      id: "gtin_behavior",
      value,
    };

    updateFormValue(gtinBehaviorFormValue);

    if (value !== "overwrite-gtin") {
      updateFormValue({
        id: "gtin",
        value: "",
      });
    }
  }

  useEffect(() => {
    if (!form.basic.gtin_behavior) {
      updateFormValue({
        id: "gtin_behavior",
        value: "keep-original-gtin",
      });
    }
  }, []);

  return (
    <Container col={{ xs: 12, md: 6, className: "mb-3" }} label="GTIN">
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <input
          type="radio"
          name="gtin-behavior"
          id="keep-original-gtin"
          value="keep-original-gtin"
          checked={gtinBehavior === "keep-original-gtin" && !!isOriginalGtinValid}
          onChange={() => handleChangeGtinBehavior("keep-original-gtin")}
          disabled={!isOriginalGtinValid}
        />
        <CLabel
          style={{ marginTop: "8px", color: isOriginalGtinValid ? "#3C4B64" : "grey" }}
          htmlFor="keep-original-gtin"
        >
          Usar GTIN do anuncio original (<b>{gtinValueReferenceOnScreen}</b>)
        </CLabel>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <input
          type="radio"
          name="gtin-behavior"
          id="no-gtin"
          value="no-gtin"
          checked={gtinBehavior === "no-gtin"}
          onChange={() => handleChangeGtinBehavior("no-gtin")}
        />
        <CLabel style={{ marginTop: "8px" }} htmlFor="no-gtin">
          Criar anúncio sem GTIN
        </CLabel>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <input
          type="radio"
          name="gtin-behavior"
          id="overwrite-gtin"
          value="overwrite-gtin"
          checked={gtinBehavior === "overwrite-gtin"}
          onChange={() => handleChangeGtinBehavior("overwrite-gtin")}
        />
        <CLabel style={{ marginTop: "8px" }} htmlFor="overwrite-gtin">
          Usar outro GTIN (informe abaixo)
        </CLabel>
      </div>

      <CInput
        style={{ width: "200px" }}
        id="gtin"
        name="gtin"
        type="text"
        value={gtinBehavior === "overwrite-gtin" ? form.basic["gtin"] : ""}
        onChange={handleFormChange}
        disabled={gtinBehavior !== "overwrite-gtin"}
      />
    </Container>
  );
};

export default Gtin;
