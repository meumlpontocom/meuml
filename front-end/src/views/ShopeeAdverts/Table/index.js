import React from "react";
import PropTypes from "prop-types";
import Header from "./Header";
import Table from "reactstrap/lib/Table";

function CustomTable({ children }) {
  return (
    <Table responsive className="table table-sm">
      <Header />
      <tbody className="table-card-responsive">{children}</tbody>
    </Table>
  );
}

CustomTable.propTypes = {
  children: PropTypes.array,
};

export default CustomTable;
