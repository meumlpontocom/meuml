import classNames                      from "classnames";
import {CCard, CCardBody, CCardHeader} from "@coreui/react";
import VariationArrow                  from "./VariationArrow";
import styled                          from "styled-components";

const InfoCardValue = styled.span`
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #3b3b3b;
  text-align: center;
`;

const Icon = styled.i`
  font-size: 2rem;
  color: #314e6e;
`;

function InfoCard({variation, total, icon, title, prepend = false}) {
  const variationColor = classNames(
    "ml-0", "ml-sm-auto", "text-xs-center", "text-sm-right",
    variation === "N/A" || typeof variation !== "string"
      ? "muted"
      : Number(variation?.split("%")[0]) > 0
        ? "text-success"
        : "text-danger"
  );
  return (
    <CCard className="brand-card card-height">
      <CCardHeader className="card-header bg-light d-flex justify-content-between">
        <Icon className={icon} color="primary"/>
        <div className={variationColor}>
          <VariationArrow variation={variation}/>
          {variation}
        </div>
      </CCardHeader>
      <CCardBody className="d-flex justify-content-around">
        <InfoCardValue>
            {
              !prepend
                ? <>{total}&nbsp;{title}</>
                : <>{title}&nbsp;{total}</>
            }
        </InfoCardValue>
      </CCardBody>
    </CCard>
  );
}

export default InfoCard;
