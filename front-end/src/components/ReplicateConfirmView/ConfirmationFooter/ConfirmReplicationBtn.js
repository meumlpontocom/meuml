import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { CButton } from "@coreui/react";
import { FaCheckDouble, FaTimes } from "react-icons/fa";
import useReplication from "../hooks/useReplication";

const ConfirmReplicationBtn = () => {
  const replication = useReplication();
  const isLoading = useSelector(state => state.advertsReplication.isLoading);
  const availableCredits = useSelector(state => state.advertsReplication.availableCredits);
  const shippingModes = useSelector(state => state.advertsReplication.shippingModes);
  const selectedShippingMode = useSelector(state => state.advertsReplication.selectedShippingMode);
  const accountsOfficialStores = useSelector(state => state.advertsReplication.accountsOfficialStores);
  const selectedOfficialStore = useSelector(state => state.advertsReplication.selectedOfficialStore);

  const accountsWithOfficialStore = accountsOfficialStores.filter(
    account => !!account.official_stores?.length,
  ).length;

  const isOfficialStoreOk = (() => {
    if (accountsWithOfficialStore === 0) return true;

    if (accountsWithOfficialStore > 1) return false;

    // must not be an empty object
    return !!Object.keys(selectedOfficialStore).length;
  })();

  const isReplicationBtnDisabled = useMemo(
    () => isLoading || !availableCredits || !shippingModes.length || selectedShippingMode === "Selecione...",
    [availableCredits, isLoading, selectedShippingMode, shippingModes.length],
  );

  return availableCredits ? (
    <CButton
      size="lg"
      color="success"
      style={{ float: "right" }}
      onClick={replication.submitRequest}
      disabled={isReplicationBtnDisabled || !isOfficialStoreOk}
      title={
        !availableCredits ? "Você não possui créditos suficientes para esta operação." : "Replicar Anúncios"
      }
    >
      Enviar pedido &nbsp;{!availableCredits ? <FaTimes /> : <FaCheckDouble />}
    </CButton>
  ) : (
    <></>
  );
};

export default ConfirmReplicationBtn;
