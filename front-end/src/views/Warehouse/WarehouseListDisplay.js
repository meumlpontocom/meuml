import React, { useState } from "react";
import { CButton, CSpinner } from "@coreui/react";
import styles from "./styles.module.scss";
import CIcon from "@coreui/icons-react";

const WarehouseListDisplay = ({
  code,
  name,
  handleDelete,
  handleEdit,
  id,
  isPrimary,
  isDefault,
  defaultButton,
  isPendingDefault,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  async function handleDeleteAndLoading() {
    setIsDeleting(true);
    await handleDelete(id, setIsDeleting);
  }

  return (
    <>
      <div className={styles.codeList}>
        <p className="mb-0">{code}</p>
      </div>
      <div className={styles.nameList}>
        <p className="mb-0">{name}</p>
      </div>
      <div
        className={`d-flex justify-content-center ${styles.defaultList}`}
      ></div>
      <div className={styles.listButtons}>
        {isPrimary ? (
          <CButton
            disabled={isPendingDefault}
            color="success"
            size="sm"
            className={`btn-pill d-flex align-items-center justify-content-center ${styles.defaultButton}`}
          >
            <span className="mr-1">Padrão </span>
            {isPendingDefault ? (
              <CSpinner size="sm" variant="grow" />
            ) : (
              <CIcon name={"cilCheckCircle"} size="sm" />
            )}
          </CButton>
        ) : (
          <CButton
            disabled={isPendingDefault}
            color="success"
            variant="outline"
            size="sm"
            className={`${styles.defaultButton}`}
            onClick={() => defaultButton(id)}
          >
            tornar padrão
          </CButton>
        )}
        <CButton
          id={id}
          color="secondary"
          size="sm"
          className={styles.editButton}
          onClick={() => handleEdit(id)}
        >
          Editar
          <i className="cil-pencil ml-1" />
        </CButton>
        <CButton
          disabled={isDeleting}
          id={id}
          color="danger"
          size="sm"
          className={styles.deleteButton}
          onClick={handleDeleteAndLoading}
        >
          Excluir
          {isDeleting ? (
            <CSpinner size="sm" className="ml-1" />
          ) : (
            <i className="cil-trash ml-1" />
          )}
        </CButton>
      </div>
    </>
  );
};

export default WarehouseListDisplay;
