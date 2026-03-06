import React from "react";

import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CFormGroup,
  CLabel,
  CInput,
  CButton,
  CSpinner,
} from "@coreui/react";

import styles from "./styles.module.scss";

const WarehouseInput = ({
  code,
  setCode,
  name,
  setName,
  warehouses,
  defaultWarehouse,
  setDefaultWarehouse,
  addWarehouse,
  isPending,
}) => {
  return (
    <CRow>
      <CCol xs="12">
        <CCard className={`p-0 ${styles.cardsWidth}`}>
          <CCardBody>
            <h6>Adicionar novo armazém</h6>
            <div className="d-flex justify-content-between align-items-end">
              <CFormGroup className={`${styles.codeInput} my-0 mr-2`}>
                <CLabel htmlFor="code">Código</CLabel>
                <CInput
                  id="code"
                  type="text"
                  placeholder="Digite o código..."
                  value={code}
                  onChange={({ target }) => setCode(target.value)}
                  required
                />
              </CFormGroup>
              <CFormGroup className={`my-0 ${styles.nameInput}`}>
                <CLabel htmlFor="name">Nome</CLabel>
                <CInput
                  id="name"
                  type="text"
                  placeholder="Digite o nome..."
                  value={name}
                  onChange={({ target }) => setName(target.value)}
                  required
                />
              </CFormGroup>
              <CButton
                disabled={isPending}
                color="primary"
                onClick={addWarehouse}
                className="d-flex align-items-center justify-content-center ml-2"
              >
                Adicionar
                {isPending ? (
                  <CSpinner size="sm ml-1" />
                ) : (
                  <i className="cil-plus ml-1" />
                )}
              </CButton>
            </div>
            <div className="mt-3 d-flex justify-content-end align-items-center">
              <label className="text-muted mb-0" htmlFor="default-warehouse">
                Definir como padrão
              </label>
              <input
                type="checkbox"
                id="default-warehouse"
                value={defaultWarehouse}
                checked={warehouses.length === 0 || defaultWarehouse}
                disabled={warehouses.length === 0}
                className="ml-2"
                style={{ transform: "scale(1.2)" }}
                onChange={() => setDefaultWarehouse(!defaultWarehouse)}
              />
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default WarehouseInput;
