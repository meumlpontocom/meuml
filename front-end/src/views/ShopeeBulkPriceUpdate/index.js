import React, { useEffect, useMemo, useState } from 'react';
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CCardFooter,
  CBadge,
  CInputGroup,
  CInputGroupText,
  CInputGroupPrepend,
  CInput,
} from "@coreui/react";
import { useSelector } from "react-redux";
import NumberFormat from "react-number-format";
import PercentageInputValidationText from './PercentageInputValidationText';
import CancelButton from './CancelButton';
import ApplyButton from './ApplyButton';
import "./index.css";
import RadioInputs from './RadioInputs';

const ShopeeBulkPriceUpdate = ({ history }) => {
  const { selected, selectAll, pagination } = useSelector((reduxStore) => reduxStore.shopee.advertising);
  const accounts = useSelector((reduxStore) => reduxStore.shopee.advertising.selectedAccounts);

  const [percentageInputClassName, setPercentageInputClassName] = useState(() => "");
  const [percentage, setPercentage] = useState(() => "");
  function handlePercentageInputValueChange({ floatValue }) {
    setPercentage(() => floatValue);
    if (floatValue >= 1 && floatValue <= 80) {
      setPercentageInputClassName(() => "is-valid");
    }
    else {
      setPercentageInputClassName(() => "is-invalid");
    }
  }

  const selectedAds = useMemo(() => {
    if (selectAll) return [];
    else return Object.values(selected)
      .filter(advert => advert.checked === true);
  }, [selectAll, selected]);

  const exceptions = useMemo(() => {
    return Object.values(selected)
      .filter(advert => advert.checked === false);
  }, [selected]);

  useEffect(() => {
    if (!selectAll && !selectedAds?.length) {
      history.goBack();
    }
  }, [history, selectAll, selected, selectedAds]);

  return (
    <CCard style={{ minHeight: window.screen.heigth <= 700 ? "375px" : "420px" }}>
      <CCardHeader>
        <CRow>
          <CCol xs={12} className="text-center">
            <h5 style={{ color: "#0080ff" }}><strong>Contas Envolvidas:</strong></h5>
            {accounts.map((account, index) => {
              return (
                <h5 key={index}>
                  {account.label.toUpperCase()}
                </h5>
              );
            })}
          </CCol>
          <CCol xs={12} className="text-center">
            <CBadge color="success">
              <span>
                Anúncios Selecionados:
                <CBadge color="secondary">
                  {selectAll
                    ? exceptions.length
                      ? pagination.total - exceptions.length
                      : "Todos"
                    : selectedAds.length
                  }
                </CBadge>
              </span>
            </CBadge>
          </CCol>
        </CRow>
      </CCardHeader>
      <CCardBody className="row align-items-center justify-content-center">
        <RadioInputs />
        <CCol xs={12} sm={8} md={6} lg={7} xl={6} xxl={5}>
          <CInputGroup>
            <CInputGroupPrepend>
              <CInputGroupText>
                <b> % </b>
              </CInputGroupText>
            </CInputGroupPrepend>
            <NumberFormat
              suffix="%"
              max={80.0}
              min={0.10}
              decimalScale={2}
              fixedDecimalScale
              decimalSeparator="."
              displayType="input"
              id="percentage-input"
              name="percentage-input"
              value={percentage}
              customInput={CInput}
              className={percentageInputClassName}
              renderText={(value) => <div>{value}</div>}
              onValueChange={handlePercentageInputValueChange}
              placeholder="Digite o aumento da porcentagem da tarifa"
            />
          </CInputGroup>
          <PercentageInputValidationText className={percentageInputClassName} />
        </CCol>
      </CCardBody>
      <CCardFooter>
        <CancelButton history={history} />
        <ApplyButton
          history={history}
          adverts={selectAll ? exceptions : selectedAds}
          className={percentageInputClassName}
          percentage={percentage}
        />
      </CCardFooter>
    </CCard>
  );
};

export default ShopeeBulkPriceUpdate;
