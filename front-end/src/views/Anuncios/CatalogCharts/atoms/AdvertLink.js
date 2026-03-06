import React, { useMemo } from "react";
import { useHistory }     from "react-router-dom";

const AdvertLink = () => {
  const history = useHistory();

  const advert = useMemo(() => {
    const { state } = history.location;
    return state && Object.keys(state).length ? state : null;
  }, [history.location]);

  return advert ? (
    <>
      <span>&nbsp;para&nbsp;</span>
      <a href={advert.url} target="_blank" rel="noreferrer">
        {advert.title}
      </a>
    </>
  ) : (
    <></>
  );
};

export default AdvertLink;
