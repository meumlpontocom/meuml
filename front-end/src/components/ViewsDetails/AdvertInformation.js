import React from "react";
import { Row, Col } from "reactstrap";
import Title from "./Title";
import DetailBadge from "./DetailBadge";
import getListingTypes from "../../helpers/getListingTypes";

export default function AdvertInformation({ advertDetails, advertId }) {
  return (
    <Row>
      <Col sm="12" md="2" lg="2" xs="12">
        <img
          alt="Imagem do Anúncio"
          id="advertImg"
          name="advertImg"
          src={advertDetails.advertising.external_data.secure_thumbnail}
          style={{ width: "125px" }}
        />
      </Col>
      <Col sm="12" md="10" lg="10" xs="12">
        <Row>
          <Title text={advertDetails.advertising.title} id={advertId} />
          <Col sm="12" md="12" lg="12" xs="12">
            <Row>
              <DetailBadge
                label="Publicação"
                data={getListingTypes(advertDetails.advertising.listing_type)}
              />
              <DetailBadge
                label="Status"
                data={
                  advertDetails.advertising.status === "active"
                    ? "Ativo"
                    : advertDetails.advertising.status === "paused"
                    ? "Pausado"
                    : "Finalizado"
                }
              />
              <DetailBadge
                label="Condição"
                data={
                  advertDetails.advertising.condition === "new"
                    ? "Novo"
                    : advertDetails.advertising.condition === "used"
                    ? "Usado"
                    : "-"
                }
              />
              <DetailBadge
                label="Frete"
                data={
                  advertDetails.advertising.shipping === "0" ? "Pago" : "Grátis"
                }
              />
              <DetailBadge
                label="Disponível"
                data={advertDetails.advertising.available_quantity}
              />
              <DetailBadge
                label="Vendidos"
                data={advertDetails.advertising.sold_quantity}
              />
              <DetailBadge
                label="Valor"
                data={
                  advertDetails.advertising.price
                    ? advertDetails.advertising.price.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        style: "currency",
                        currency: "BRL",
                      })
                    : "-"
                }
              />
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
