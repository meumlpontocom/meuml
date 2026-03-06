import React     from "react";
import PropTypes from "prop-types";

export const ToastDone = ({ resp }) => (
  <div id="reviewYourAdvertsMessage">
    <h5><strong>Vá para a tela de processos e confira!</strong></h5>
    <p>{resp}</p>
  </div>
);

ToastDone.propTypes = {
  closeToast: PropTypes.func,
  resp: PropTypes.string.isRequired
};

ToastDone.propTypes = {
  closeToast: null
};
