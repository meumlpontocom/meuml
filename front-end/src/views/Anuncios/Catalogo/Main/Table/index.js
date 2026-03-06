import React from "react";
import { useSelector } from "react-redux";
import Table from "reactstrap/lib/Table";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import "./styles.scss";

export default function CustomTable({ children }) {
  const { advertising } = useSelector((state) => state.catalog);
  return Object.keys(advertising).length ? (
    <Table className="table table-sm table-overflow">
      <TableHeader />
      <TableBody>{children}</TableBody>
    </Table>
  ) : (
    <></>
  );
}
