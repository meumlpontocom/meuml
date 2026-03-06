import React, { useCallback, useState }                             from "react";
import Swal                                                         from "sweetalert2";
import { FaPlusCircle }                                             from "react-icons/fa";
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from "@coreui/react";
import { Redirect }                                                 from "react-router-dom";

const AddAccount = () => {
  const [redirect, setRedirect] = useState("");

  const setNextURL = useCallback((url) =>
    localStorage.setItem("@MeuML#NextURL", url)
  , []);

  const launchPopup = useCallback(async text =>
    await Swal.fire({
      type: "warning",
      title: "Atenção!",
      text,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Confirmar",
    }), []);

  const addMlAccount = useCallback(async () => {
    const { value } = await launchPopup(
      "Esta ação irá adicionar a conta Mercado Livre que está logada neste navegador.",
    );
    if (value) {
      setNextURL(`${process.env.REACT_APP_API_URL}/oauth/mercado-livre/authorize`);
      setRedirect(true);
    }
  }, [launchPopup, setNextURL, setRedirect]);

  const addShopeeAccount = useCallback(async () => {
    const { value } = await launchPopup(
      "Agora você será redirecionado para a Central do Vendedor Shopee."
    );
    if (value) {
      setNextURL(`${process.env.REACT_APP_API_URL}/shopee/add_account`);
      setRedirect(true);
    }
  }, [launchPopup, setNextURL, setRedirect]);

  return (
    <CDropdown>
      {!redirect ? <></> : <Redirect to="/callback" />}
      <CDropdownToggle color="primary" size="lg">
        <FaPlusCircle className="mb-1" />
        &nbsp;Adicionar Conta
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem onClick={addMlAccount}>Mercado Livre</CDropdownItem>
        <CDropdownItem onClick={addShopeeAccount}>Shopee</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AddAccount;
