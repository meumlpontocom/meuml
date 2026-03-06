import React from "react";
import Main from "./Main";
import Col from "reactstrap/lib/Col";

export default function AdvertImgCarousel({ advertData }) {
  return (
    <Col
      xs="12"
      sm="12"
      md="5"
      lg="5"
      xl="3"
      style={{ width: "300px", padding: "30px" }}
    >
      <h5>Imagens do anúncio</h5>
      <Main
        items={advertData?.pictures?.map((pic, index) => ({
          src: pic.secure_url,
          altText: "Imagem do anúncio",
          header: `Qualidade: ${pic.quality}`,
          key: index,
        }))}
      />
    </Col>
  );
}
