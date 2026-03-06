import React           from "react";
import PropTypes       from "prop-types";
import { CAlert }      from "@coreui/react";
import LoadingCardData from "src/components/LoadingCardData";

const Loading = ({ isLoading }) =>
  isLoading ? (
    <CAlert color="secondary">
      <LoadingCardData />
    </CAlert>
  ) : (
    <></>
  );

Loading.propTypes = {
  isLoading: PropTypes.bool.isRequired,
};

export default Loading;
