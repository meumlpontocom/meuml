import React, {useContext, useMemo} from "react";
import Swal from "sweetalert2";
import vacationRequests from "./requests";
import vacationContext from "./vacationContext";
import {CCol, CCard, CCardHeader, CCardBody, CCardFooter, CButton} from "@coreui/react";

const CurrentlyOnVacation = () => {
  const {accountsOnVacation, history, setLoading, showAllVacations} = useContext(vacationContext);
  const fetch = new vacationRequests(setLoading, history);
  const handleDelete = async ({id, accounts}) => {
    const user = await Swal.fire({
      title: "Atenção!",
      type: "warning",
      text: "Você tem certeza que deseja finalizar o modo férias das contas " + accounts,
      showCloseButton: true,
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Sim, finalizar",
      cancelButtonText: "Cancelar"
    });
    if (user.value === true) {
      fetch.deactivateVacationMode({vacationId: id})
    }
  }

  const vacationList = useMemo(() => {
    if (showAllVacations === true) {
      return accountsOnVacation;
    } else {
      return accountsOnVacation.filter(({has_finished}) => has_finished === false);
    }
  }, [accountsOnVacation, showAllVacations]);

  return accountsOnVacation.length ? vacationList.map((account, index) => (
    <CCol xs={12} sm={6}>
      <CCard
        key={index}
        className={`mb-3 card-accent-${account.has_started && !account.has_finished
          ? "success"
          : !account.has_started && !account.has_finished
            ? "info"
            : account.has_started && account.has_finished
              ? "secondary"
              : "warning"}`
        }
      >
        <CCardHeader>
          <h6>
            <b>Conta de Férias:</b> {account.accounts}
          </h6>
        </CCardHeader>
        <CCardBody>
          <p><b>Tipo:</b> {account.vacation_type === 1 ? "Anúncios Pausados" : "Prazo de Envio Automatizado"}</p>
          <p><b>Criado em:</b> {account.date_created}</p>
          <p><b>Início:</b> {!account.starts_at ? account.date_created : account.starts_at}</p>
          <p><b>Término:</b> {!account.ends_at ? "Não programado" : account.ends_at}</p>
        </CCardBody>
        <CCardFooter>
          <CButton
            disabled={account.has_finished}
            style={{float: "right"}}
            color={account.has_finished ? "secondary" : "danger"}
            onClick={() => handleDelete({id: account.id, accounts: account.accounts})}
          >
            <i className="cil-x-circle mr-1"/>
            {account.has_finished ? "Férias Finalizada ou Expirada" : "Desativar Modo Férias"}
          </CButton>
        </CCardFooter>
      </CCard>
    </CCol>
  )) : (
    <CCol>
      <CCard>
        <CCardBody>
          <h3>Não foram encontrados registros nesta conta MeuML.</h3>
        </CCardBody>
      </CCard>
    </CCol>
  );
};

export default CurrentlyOnVacation;
