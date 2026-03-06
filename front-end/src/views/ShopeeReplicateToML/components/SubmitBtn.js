/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useContext, useState } from "react";
import Button from "./Button";
import classnames from "classnames";
import Swal from "sweetalert2";
import { CCol } from "@coreui/react";
import { FaCheckCircle, FaSearch } from "react-icons/fa";
import useReplicate from "../hooks/useReplicate";
import useIsXsDisplay from "../hooks/useIsXsDisplay";
import shopeeReplicateToMLContext from "../shopeeReplicateToMLContext";

const SubmitBtn = () => {
  const isSmallDisplay = useIsXsDisplay();
  const [validateForm, submitReplicationRequest] = useReplicate();
  const {
    selectedCategory,
    showAdvertPreview,
    setShowAdvertPreview,
    accountsOfficialStores,
    selectedOfficialStore,
  } = useContext(shopeeReplicateToMLContext);
  const columnConfig = classnames(isSmallDisplay ? "d-flex justify-content-center" : "text-right");

  const handleSubmitBtnClick = useCallback(async () => {
    if (validateForm()) {
      if (!showAdvertPreview) return setShowAdvertPreview(true);
      await submitReplicationRequest();
    } else {
      await Swal.fire({
        title: "Atenção!",
        text: "Certifique-se de preencher todos os campos.",
        type: "warning",
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: "Fechar",
        showCloseButton: true,
      });
    }
  }, [submitReplicationRequest, showAdvertPreview]);

  const accountsWithOfficialStore = accountsOfficialStores.filter(
    account => !!account.official_stores?.length,
  ).length;

  const isOfficialStoreOk = (() => {
    if (accountsWithOfficialStore === 0) return true;

    if (accountsWithOfficialStore > 1) return false;

    return selectedOfficialStore !== null;
  })();

  return !selectedCategory.category_id && !selectedCategory.id ? (
    <></>
  ) : (
    <CCol xs={12} sm={6} className={columnConfig}>
      <Button
        size="lg"
        block={isSmallDisplay}
        onClick={handleSubmitBtnClick}
        color={!showAdvertPreview ? "primary" : "success"}
        disabled={!isOfficialStoreOk}
      >
        {!showAdvertPreview && (
          <>
            <FaSearch className="mb-1 mr-2" />
            Ver prévia do anúncio
          </>
        )}
        {showAdvertPreview && (
          <>
            <FaCheckCircle className="mb-1 mr-2" />
            Replicar
          </>
        )}
      </Button>
    </CCol>
  );
};

export default SubmitBtn;
