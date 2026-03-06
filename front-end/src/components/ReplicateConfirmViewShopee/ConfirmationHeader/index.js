import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CCard, CCardBody, CRow, CCol } from "@coreui/react";
import { useHistory } from "react-router-dom";
import SelectAccounts from "../../SelectAccounts";
import SelectedInfo from "../ConfirmationBody/SelectedInfo";
import EstimatedCoast from "../ConfirmationBody/EstimatedCoast";
import { saveSelectedAccounts } from "../../../redux/actions/_replicationActions";
import AvailableCreditsCallout from "../ConfirmationBody/AvailableCreditsCallout";

export default function ConfirmationHeader() {
  const history = useHistory();
  const dispatch = useDispatch();
  const selectedAccounts = useSelector(state => state.advertsReplication.selectedAccounts);

  const setSelectedAccounts = useCallback(
    selected => {
      dispatch(saveSelectedAccounts([selected]));
    },
    [dispatch],
  );

  return (
    <CCard>
      <CCardBody>
        <CRow className="mb-3">
          <AvailableCreditsCallout />
          <SelectedInfo history={history} />
          <EstimatedCoast />
          <CCol xs={12} sm={12} md={12} lg={4} className="mt-4">
            <h4 className="text-info">Selecionar conta</h4>
            <SelectAccounts
              id="select-accounts"
              name="select-accounts"
              placeholder="Selecionar contas de destino"
              selected={selectedAccounts}
              callback={setSelectedAccounts}
              multipleSelection={false}
              platform="SP"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
}
