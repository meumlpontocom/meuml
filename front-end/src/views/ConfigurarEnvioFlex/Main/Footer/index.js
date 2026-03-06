import React, { useContext, useMemo, useState } from "react";
import { CRow, CButton, CCardFooter, CSpinner } from "@coreui/react";
import { useHistory } from "react-router";
import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";
import Swal from "sweetalert2";
import styled from "styled-components";
import { FlexConfigContext } from "../../FlexConfigContext";

export default function Footer({ accountId }) {
  const {
    deliveryWindow,
    capacity,
    isSaturdayEnabled,
    isSundayEnabled,
    cutoffWeekday,
    cutoffSaturday,
    cutoffSunday,
  } = useContext(FlexConfigContext);

  const [saveBtnTip, setSaveBtnTip] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const history = useHistory();

  const saveBtnIsDisabled = useMemo(() => {
    if (deliveryWindow === "same_day") {
      return false;
    } else if (deliveryWindow === "next_day") {
      if (cutoffWeekday) return false;
      else {
        setSaveBtnTip("É obrigatório informar um horário limite se a postagem for no dia seguinte.");
        return true;
      }
    }
  }, [cutoffWeekday, deliveryWindow]);

  async function submit() {
    try {
      setIsLoading(true);
      if (accountId && deliveryWindow && cutoffWeekday && (capacity || capacity === 0)) {
        const formData = new FormData();
        formData.append("account_id", accountId);
        formData.append("delivery_window", deliveryWindow);
        formData.append("capacity", capacity);
        formData.append("cutoff_weekday", cutoffWeekday);
        formData.append("is_saturday_enabled", Number(isSaturdayEnabled));
        formData.append("cutoff_saturday", cutoffSaturday);
        formData.append("is_sunday_enabled", Number(isSundayEnabled));
        formData.append("cutoff_sunday", cutoffSunday);

        const url = `shipping/mercado-envios-flex/adopt`;
        const response = await api.post(url, formData, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (response.data.status === "success") {
          Swal.fire({
            title: "Sucesso!",
            html: `<p>${response.data.message}</p>`,
            showCloseButton: true,
            type: "success",
          }).then(() => window.location.assign("/#/contas"));
        }
      } else {
        Swal.fire({
          title: "Atenção",
          html: "<p>Certifique-se de preencher todos os campos obrigatórios para prosseguir.</p>",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      if (error.response) {
        if (error.response.data.status === "error") {
          window.location.assign("/#/contas");
        }
        Swal.fire({
          title: "Erro!",
          html: `<p>${error.response.data.message}</p>`,
          type: "error",
          showCloseButton: true,
        });
        return error.response;
      }
      Swal.fire({
        title: "Erro!",
        html: `<p>${error.message ? error.message : error}</p>`,
        type: "error",
        showCloseButton: true,
      });
      return error;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <CCardFooter>
      <CRow className="d-flex justify-content-end p-1">
        <StyledButton color="secondary" onClick={() => history.push("/contas")}>
          Cancelar
        </StyledButton>

        <StyledButton
          onClick={submit}
          color="primary"
          title={saveBtnTip}
          disabled={saveBtnIsDisabled || isLoading}
        >
          Salvar
          {isLoading && <CSpinner size="sm" className="ml-1" />}
        </StyledButton>
      </CRow>
    </CCardFooter>
  );
}

const StyledButton = styled(CButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  min-height: 33px;
  margin-right: 10px;

  a {
    text-decoration: none;
    color: inherit;
  }
`;
