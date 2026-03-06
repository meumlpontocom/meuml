import React                                              from "react";
import FlexShipping                                       from "./FlexShipping";
import { Col, Row }                                       from "reactstrap";
import { useSelector }                                    from "react-redux";
import { Id, Title, Condition, AdvertType, FreeShipping } from "./_components";
import DescriptionPreview                                 from "./Description";
import styled                                             from "styled-components";
import Promotions                                             from "src/components/Promotions";

const AdvertDescription = ({
  id,
  title,
  listing,
  shipping,
  condition,
  dateCreated,
  externalData,
  originalPrice,
  ownerAccountName,
  dateLastModified,
  advertLink,
  shippingTags,
  description,
  promotions
}) => {
  const components = useSelector((state) => state.components);
  const conditionStatus = components.components.filter(x => x.code === "condition");
  const advertType = components.components.filter(x => x.code === "advert_type");
  const freeShipping = components.components.filter(x => x.code === "free_shipping");
  const createDateTimeString = (string) => String(new Date(string)
    .toLocaleDateString("pt-br", { hour: "2-digit", minute: "2-digit" }));
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
          <FlexContainer>
            <Id id={id} advertLink={advertLink} />
            <Condition
              status={conditionStatus[0].status}
              condition={condition}
            />
            <Promotions promotions={promotions} />
          </FlexContainer>
          <AdvertType status={advertType[0].status} listing={listing} />
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

const FlexContainer = styled.div`
  margin-bottom: 0.25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
`;

export default AdvertDescription;
