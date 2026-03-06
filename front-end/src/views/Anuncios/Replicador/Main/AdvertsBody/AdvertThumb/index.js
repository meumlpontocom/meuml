import React from "react";
import Col from "reactstrap/lib/Col";
import { useSelector } from "react-redux";

export default function AdvertThumb({ id }) {
  const { thumbnail } = useSelector((state) => {
    const { adverts } = state.advertsReplication;
    const advertToUpdate = adverts.filter((advert) => advert.id === id);
    return advertToUpdate[0];
  });
  return (
    <Col style={{ padding: "0px", marginRight: "8px" }}>
      <img alt="Imagem de capa" src={thumbnail.replace('http', 'https')} width={70} />
    </Col>
  );
}
