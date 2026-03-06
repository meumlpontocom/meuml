import React from "react";
import { Table } from "reactstrap";
import TableBody from "./Body";
import TableHeader from "./Header";
import "./index.css";

export default function AdvertQualityTable({ advertsPositionGrid }) {
  return (
    <Table responsive className="table table-sm">
      <TableHeader show={advertsPositionGrid.length > 0 ? true : false} />
      <TableBody advertsPositionGrid={advertsPositionGrid} />
    </Table>
  );
}
