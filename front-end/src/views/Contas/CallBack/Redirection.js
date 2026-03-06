import React        from "react";
import PropTypes    from "prop-types";
import { Redirect } from "react-router-dom";

const Redirection = ({ redirect }) => {
  return redirect ? <Redirect from="/callback" to="/contas" /> : <></>;
};

Redirection.propTypes = {
  redirect: PropTypes.bool.isRequired
}

export default Redirection;
