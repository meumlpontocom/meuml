import React, { useEffect, useState } from "react";
import { Redirect, useHistory }       from "react-router";

const RedirectToShopeeAds = () => {
  const history                 = useHistory();
  const [redirect, setRedirect] = useState(false);
  useEffect(() => {
    if (!history.location.state) setRedirect(true);
  }, [history]);
  return redirect
    ? <Redirect to="/anuncios-shopee" from="/replicar-anuncios-shopee/mercado-livre" />
    : <></>;
};

export default RedirectToShopeeAds;
