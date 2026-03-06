import React, { useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { CCol, CCard, CCardHeader, CCardBody } from "@coreui/react";
import { useHistory } from "react-router-dom";
import shopeeReplicateToMLContext from "../../shopeeReplicateToMLContext";
import { FaSearchPlus } from "react-icons/fa";
import { useLocation } from "react-router";
import Loading from "react-loading";
import { calculateTotalAdsToBeCreated } from "src/components/ReplicateConfirmView/ConfirmationHeader/calculateTotalAdsToBeCreated";

const ReplicationInfo = () => {
  const [isLoadingCost, setIsLoadingCost] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [missingCategoryMessage, setMissingCategoryMessage] = useState("");

  const history = useHistory();
  const { selectedAccounts, setVariationsAmount, selectedCategory } = useContext(shopeeReplicateToMLContext);
  const { account_id } = useMemo(() => history.location.state, [history.location.state]);
  const shopeeAccount = useSelector(state => state.accounts.accounts[account_id]);
  const location = useLocation();
  const advert = location.state;

  const Label = ({ children }) => <strong className="text-success">{children}&nbsp;</strong>;

  async function calculateReplicationCost() {
    const adsToBeCreated = await calculateTotalAdsToBeCreated(
      selectedAccounts[0].id,
      selectedCategory.category_id,
      advert.id,
    );

    return adsToBeCreated;
  }

  async function calculateEstimatedCost() {
    setMissingCategoryMessage("");
    if (selectedAccounts.length === 0) {
      setEstimatedCost(0);
      return;
    }

    setIsLoadingCost(true);

    const accountTags = selectedAccounts[0].external_data?.tags;
    const accountHasUserProduct = accountTags.includes("user_product_seller");

    if (!accountHasUserProduct) {
      setVariationsAmount(1);
      const totalPrice = 1 * 0.25;
      const formattedPrice = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
        totalPrice,
      );
      setEstimatedCost(formattedPrice);
      setIsLoadingCost(false);
      return;
    }

    if (!selectedCategory.category_id) {
      setMissingCategoryMessage("Selecione uma categoria para calcular o preço");
      setVariationsAmount(0);

      const formattedPrice = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(0);
      setEstimatedCost(formattedPrice);
      setIsLoadingCost(false);
      return;
    }

    const adsToBeCreated = await calculateReplicationCost();
    setVariationsAmount(adsToBeCreated);
    const totalPrice = adsToBeCreated * 0.25;
    const formattedPrice = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      totalPrice,
    );

    setEstimatedCost(formattedPrice);
    setIsLoadingCost(false);
  }

  useEffect(() => {
    calculateEstimatedCost();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- calculateEstimatedCost is redefined every render; only recalculate when inputs change
  }, [selectedAccounts, selectedCategory]);

  return (
    <CCol xs={12} md={6}>
      <CCard>
        <CCardHeader className="bg-gradient-secondary">
          <h4 className="text-muted">
            <FaSearchPlus />
            &nbsp; Detalhes da replicação
          </h4>
        </CCardHeader>
        <CCardBody>
          <p>
            <Label>Conta de origem:</Label>
            {shopeeAccount.name}
          </p>
          <p>
            <Label>Conta{selectedAccounts.length > 1 && "s"} de destino:</Label>
            {selectedAccounts.map(({ name }) => name).join(", ")}
          </p>
          <p style={{ display: "flex", gap: "4px" }}>
            <Label>Custo:</Label>
            {isLoadingCost ? <Loading type="bars" color="#054785" height={12} width={24} /> : estimatedCost}
          </p>
          {missingCategoryMessage && (
            <span style={{ fontSize: "14px", color: "red" }}> {missingCategoryMessage} </span>
          )}
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default ReplicationInfo;
