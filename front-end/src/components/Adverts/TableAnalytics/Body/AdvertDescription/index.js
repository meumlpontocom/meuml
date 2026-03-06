import React from "react";
import FlexShipping from "./FlexShipping";
import { Col, Row } from "reactstrap";
import { useSelector } from "react-redux";
import { Title, FreeShipping } from "./_components";
import DescriptionPreview from "./Description";

const AdvertDescription = ({
  id,
  title,
  listing,
  shipping,
  condition,
  dateCreated,
  ownerAccountName,
  dateLastModified,
  advertLink,
  shippingTags,
  description,
  promotions,
}) => {
  const components = useSelector(state => state.components);
  const freeShipping = components.components.filter(x => x.code === "free_shipping");

  const createDateTimeString = string =>
    String(new Date(string).toLocaleDateString("pt-br", { hour: "2-digit", minute: "2-digit" }));

  return (
    <td
      id="description"
      name="description"
      style={{ verticalAlign: "middle" }}
      className="advert-description"
    >
      <Row>
        <Col sm="12" md="12" lg="12" xs="12">
          <Title title={title} owner={ownerAccountName} />
          <FreeShipping status={freeShipping[0].status} shipping={shipping} />
          <FlexShipping advertTags={shippingTags} />
          <span style={{ color: "#6b6b6b", marginTop: "5px" }}>
            <br />
            <span className="mr-2">
              <i className="cil-calendar mr-1" />
              Criado em: {createDateTimeString(dateCreated)}
            </span>
            <span>
              <i className="cil-calendar-check mr-1" />
              Última Modificação: {createDateTimeString(dateLastModified)}
            </span>
          </span>
          <DescriptionPreview advertTitle={title} text={description} />
        </Col>
      </Row>
    </td>
  );
};

export default AdvertDescription;
