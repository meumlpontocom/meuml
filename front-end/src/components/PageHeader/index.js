import { CCard, CCardHeader } from "@coreui/react";
import PropTypes from "prop-types";
import styled from "styled-components";

const MainHeadingStyles = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    width: fit-content;
    margin-bottom: 0;
  }

  h3 small {
    margin-left: 10px;
  }
`;

const PageHeader = ({ heading, subheading }) => {
  return (
    <CCard>
      <CCardHeader className="bg-primary text-white">
        <MainHeadingStyles>
          <h2>
            {heading} <small className="text-muted">{subheading}</small>
          </h2>
        </MainHeadingStyles>
      </CCardHeader>
    </CCard>
  );
};

PageHeader.propTypes = {
  heading: PropTypes.string,
  subheading: PropTypes.string,
};

export default PageHeader;
