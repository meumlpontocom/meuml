import React, { useContext, useMemo } from "react";
import classNames                     from "classnames";
import Container                      from "./Container";
import { CInput }                     from "@coreui/react";
import shopeeReplicateToMLContext     from "../../shopeeReplicateToMLContext";

const Title = ({ handleFormChange }) => {
  const { form }           = useContext(shopeeReplicateToMLContext);
  const hasValidationError = useMemo(() => form.basic["title"].length > 60, [form.basic]);
  const className          = classNames(hasValidationError ? "is-invalid" : "");
  return (
    <Container col={{ xs: 12, className: "mb-3" }} label="Título">
      <CInput
        id="title"
        name="title"
        type="text"
        className={className}
        value={form.basic["title"]}
        onChange={handleFormChange}
        placeholder="Título do anúncio"
      />
      {hasValidationError ? (
        <small className="text-danger">
          Tamanho máximo de título permitido: 60 caracteres. Atualmente: {form.basic.title.length}
        </small>
      ) : (
        <></>
      )}
    </Container>
  );
};

export default Title;
