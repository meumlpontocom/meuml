import React from "react";
import Button from "reactstrap/lib/Button";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { Redirect } from "react-router-dom";

function InvoiceButton({
  id,
  payment_status,
  nfse_status,
  payment_type,
  date_modified,
  price,
}) {
  const [redirect, setRedirect] = React.useState(false);
  async function handleNfCreation() {
    if (nfse_status === "PROCESSANDO") {
      Swal.fire({
        title: "Atenção",
        text: `A nota fiscal do pedido ${id} encontra-se atualmente em processamento.`,
        type: "info",
        showCloseButton: true,
      });
    } else {
      setRedirect(true);
    }
  }
  return (
    <Button
      onClick={handleNfCreation}
      color="primary"
      disabled={payment_status === "Confirmado" ? false : true}
    >
      <i className="cil-pencil mr-1" />
      {redirect ? (
        <Redirect
          from="/assinaturas/historico"
          to={{
            pathname: "/solicitar-nota-fiscal",
            state: {
              id,
              payment_status,
              nfse_status,
              payment_type,
              date_modified,
              price,
            },
          }}
        />
      ) : (
        <></>
      )}
      Gerar NF
    </Button>
  );
}

InvoiceButton.propTypes = {
  payment_status: PropTypes.string,
};

export default InvoiceButton;
