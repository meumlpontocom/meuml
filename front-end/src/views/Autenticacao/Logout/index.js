import {useEffect, useState} from "react";
import {logout}              from "../../../services/auth";
import {Redirect}            from "react-router";

function Logout() {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    logout();
    setRedirect(true);
  }, []);

  return redirect ? <Redirect to="/entrar"/> : <></>;
}

export default Logout;
