import React from "react";
import { CCard, CCardBody } from "@coreui/react";
import styled from "styled-components";

const CardWrapper = styled.div`
  .card {
    min-width: 235px;
  }
  @media (max-width: 1800px) {
    font-size: 0.9em;
    .card {
      min-width: 100px;
    }
  }
  @media (max-width: 1500px) {
    margin: 0 auto;
  }
  @media (max-width: 500px) {
    width: 100%;
    font-size: 1em;
  }
`;

const ReplicationInfoCard = ({ title, value }) => {
  return (
    <CardWrapper className="p-3">
      <CCard className="bg-gradient-dark text-white my-0">
        <CCardBody>
          <div className="text-muted text-uppercase font-weight-bold">
            {title}
          </div>
          <div className="text-value-lg">{value}</div>
        </CCardBody>
      </CCard>
    </CardWrapper>
  );
};

export default ReplicationInfoCard;
