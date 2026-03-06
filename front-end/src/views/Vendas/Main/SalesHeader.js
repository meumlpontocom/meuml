import { CButton, CInputCheckbox } from "@coreui/react";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  setSelectedSale,
  toggleIsCardOpen,
} from "../../../redux/actions/_salesActions";
import TrackShipment from "./TrackShipment";

const SalesHeader = ({ toggleKey }) => {
  const ReactSwal = withReactContent(Swal);
  const dispatch = useDispatch();
  const toggle = () => dispatch(toggleIsCardOpen(toggleKey));
  const { selectedSales, selectAllSales, isCardOpen } = useSelector(
    (state) => state.sales
  );
  const {
    sale: { id, date_closed, account_id },
    shipments,
  } = useSelector(({ sales: { sales } }) => sales[toggleKey]);

  const accountName = useSelector(
    (state) => state.accounts.accounts[account_id]?.name
  );
  const isChecked = useMemo(() => {
    return selectAllSales && selectedSales[toggleKey]
      ? true
      : selectAllSales && !selectedSales[toggleKey]
      ? false
      : selectedSales[toggleKey];
  }, [selectAllSales, selectedSales, toggleKey]);

  const DatePtBr = () => {
    return (
      <u style={{ color: "var(--gray)", textDecoration: "none" }}>
        {new Date(`${date_closed} GMT-04:00`).toLocaleDateString("pt-BR")}
      </u>
    );
  };

  const DateTime = () => {
    return (
      <u style={{ color: "var(--gray)", textDecoration: "none" }}>
        {new Date(`${date_closed} GMT-04:00`).toLocaleTimeString("pt-BR")}
      </u>
    );
  };

  function handleCheckboxChange(event) {
    const { id, checked } = event.target;
    dispatch(setSelectedSale({ id, checked }));
  }

  function handleSaleTrackingClick() {
    ReactSwal.fire({
      title: "Links disponíveis",
      type: "info",
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: "Fechar",
      html: <TrackShipment shipments={shipments} />,
    });
  }

  return (
    <div className="salescard-top p-2 rounded-top bg-secondary theme-color">
      <div className="ml-2 pl-3 d-flex flex-row flex-wrap">
        <CInputCheckbox
          id={id}
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <p className="d-inline ml-2 mb-0 text-primary">
          <strong>{accountName}</strong>
        </p>
        <p
          className="d-inline text-muted ml-2 mb-0"
          style={{ fontWeight: "bolder" }}
        >
          #{id}
        </p>
        <p className="d-inline ml-2 tex-muted mb-0">
          <DatePtBr />
        </p>
        <p className="d-inline ml-2 tex-muted mb-0">
          <DateTime />
        </p>
        <CButton
          className="ml-auto salescard-top-btn p-0 btn-ghost-dark"
          onClick={handleSaleTrackingClick}
        >
          <i className="cil-truck mr-1 icon-fix" />
          Rastrear venda
        </CButton>
        <CButton
          className="salescard-top-btn p-0 btn-ghost-dark"
          onClick={() => toggle()}
        >
          <i
            className={`cil-chevron-circle-${
              isCardOpen[toggleKey] ? "up" : "down"
            }-alt mr-1 icon-fix`}
          />
          {isCardOpen[toggleKey] ? "Ver menos" : "Ver detalhes"}
        </CButton>
      </div>
    </div>
  );
};

export default SalesHeader;
