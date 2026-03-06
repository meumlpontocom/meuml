import React from "react";
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CSpinner,
} from "@coreui/react";
import styles from "./styles.module.scss";
import WarehouseEditInput from "./WarehouseEditInput";
import WarehouseListDisplay from "./WarehouseListDisplay";

const WarehousesList = ({
  updateCode,
  setUpdateCode,
  updateName,
  setUpdateName,
  handleClean,
  handleUpdate,
  handleEdit,
  handleDelete,
  warehouses,
  editing,
  defaultButton,
  isPending,
  isPendingEdit,
  isPendingDefault,
}) => {
  return (
    <CRow>
      <CCol>
        <CCard className={styles.cardsWidth}>
          <CCardHeader className="d-flex">
            <div className={`${styles.codeInput}`}>
              <p className="h6 pb-0 mb-0">Código</p>
            </div>
            <div className={styles.nameInput}>
              <p className="h6 pb-0 mb-0">Nome</p>
            </div>
          </CCardHeader>
          <CCardBody>
            {warehouses.map(
              ({ id, name, code, isPrimary, is_default }, index) => (
                <div
                  className={styles.warehouseList}
                  key={id + index.toString()}
                >
                  {editing === id ? (
                    <WarehouseEditInput
                      updateCode={updateCode}
                      setUpdateCode={setUpdateCode}
                      updateName={updateName}
                      setUpdateName={setUpdateName}
                      handleClean={handleClean}
                      handleUpdate={handleUpdate}
                      id={id}
                      name={name}
                      code={code}
                      isPrimary={is_default}
                      isPendingEdit={isPendingEdit}
                    />
                  ) : (
                    <WarehouseListDisplay
                      code={code}
                      name={name}
                      handleDelete={handleDelete}
                      handleEdit={handleEdit}
                      isPrimary={is_default}
                      isDefault={is_default}
                      id={id}
                      defaultButton={defaultButton}
                      isPendingDefault={isPendingDefault}
                    />
                  )}
                </div>
              )
            )}
            {isPending && (
              <div className="mt-3 d-flex justify-content-center">
                <CSpinner size="sm" />
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default WarehousesList;
