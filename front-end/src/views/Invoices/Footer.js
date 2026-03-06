import React from "react";
import Button from "reactstrap/lib/Button";
import CardFooter from "reactstrap/lib/CardFooter";
import PropTypes from "prop-types";

function CustomFooter({ history, handleSubmitInvoice }) {
  return (
    <CardFooter>
      <Button onClick={() => history.goBack()} className="float-left">
        <i className="cil-arrow-left mr-1" />
        Voltar
      </Button>
      <Button color="primary" onClick={handleSubmitInvoice}>
        <i className="cil-check mr-1" />
        Salvar
      </Button>
    </CardFooter>
  );
}

CustomFooter.propTypes = {
  history: PropTypes.object,
  handleSubmitInvoice: PropTypes.func,
};

export default CustomFooter;
