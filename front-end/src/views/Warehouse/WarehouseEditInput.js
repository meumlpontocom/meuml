import React, { useEffect } from "react";

import { CForm, CInput, CButton, CSpinner } from "@coreui/react";

import styles from "./styles.module.scss";

const WarehouseEditInput = ({
  updateCode,
  setUpdateCode,
  updateName,
  setUpdateName,
  handleClean,
  handleUpdate,
  id,
  code,
  name,
  isPendingEdit,
}) => {
  useEffect(() => setUpdateCode(code), [code, setUpdateCode]);
  useEffect(() => setUpdateName(name), [name, setUpdateName]);
  return (
    <>
      <div className={styles.listCodeInput}>
        <CForm className={`my-0`}>
          <CInput
            id="code"
            type="text"
            value={updateCode}
            placeholder={code}
            onChange={({ target }) => setUpdateCode(target.value)}
          />
        </CForm>
      </div>
      <div className={styles.listNameInput}>
        <CForm className={`my-0 flex-grow-1`}>
          <CInput
            id="name"
            type="text"
            value={updateName}
            placeholder={name}
            onChange={({ target }) => setUpdateName(target.value)}
          />
        </CForm>
      </div>
      <div className={styles.listButtons}>
        <CButton
          color="warning"
          size="sm"
          className={styles.clearButton}
          onClick={() => handleClean()}
        >
          Cancelar
          <i className="cil-arrow-circle-left ml-1" />
        </CButton>
        <CButton
          disabled={isPendingEdit}
          color="success"
          size="sm"
          className={styles.confirmButton}
          onClick={() => {
            handleUpdate(id);
          }}
        >
          Salvar
          {isPendingEdit ? (
            <CSpinner size="sm ml-1" />
          ) : (
            <i className="cil-check ml-1" />
          )}
        </CButton>
      </div>
    </>
  );
};

export default WarehouseEditInput;
