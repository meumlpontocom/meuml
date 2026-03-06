import React from "react";
import { Table } from "reactstrap";
import ItemUnitComplete from "./ItemUnitComplete";
import { useSelector } from "react-redux";
import formatMoney from "../../../../helpers/formatMoney";

const ItemsDetailsComplete = ({ id }) => {
  const { sales } = useSelector((state) => state.sales);

  const quantity = sales[id].items
    .map(({ quantity }) => quantity)
    .reduce((previous, current) => {
      return previous + current;
    }, 0);

  return (
    <div className="border border-dark rounded p-0" style={{overflowX: "auto"}}>
      <Table borderless>
        <thead>
          <tr className="items-header">
            <td colSpan="2">
              <p className="salescard-body-title mb-0">Items</p>
            </td>
            <td>
              <p className="salescard-body-title mb-0">Qtd.</p>
            </td>
            <td>
              <p className="salescard-body-title mb-0">Valor</p>
            </td>
          </tr>
        </thead>
        <ItemUnitComplete id={id} />
        <tbody>
          <tr className="items-footer">
            <td className="w-100">
              {/* <Button className="btn btn-info text-white p-1">
            {" "}
            <i className="cil-description mr-1" /> Imprimir NF
            </Button> */}
            </td>
            <td style={{ minWidth: "120px" }}>
              <div className="d-md-block d-lg-none d-xl-block">
                <p className="mb-0">Total bruto</p>
                <p className="mb-0">Tarifa da venda</p>
                <p className="mb-0">Total líquido</p>
              </div>
            </td>
            <td>
              <div>
                <p
                  className="mb-0 text-info"
                  style={{ overflowX: "auto", height: "21px", width: "80px" }}
                >
                  {quantity} un.
                </p>
                <p className="mb-0 text-danger">
                  {(
                    (sales[id].sale.total_sale_fee /
                      sales[id].sale.total_amount) *
                    100
                  ).toFixed(0)}
                  %
                </p>
                <p className="mb-0"></p>
              </div>
            </td>
            {sales[id].items.map((item, index) => {
              return (
                <td key={index} colSpan="3">
                  <div>
                    <p className="mb-0 text-primary text-right">
                      {formatMoney(sales[id].sale.total_amount)}
                    </p>
                    <p className="mb-0 text-danger">
                      {formatMoney(-sales[id].sale.total_sale_fee)}
                    </p>
                    <p className="mb-0 text-success">
                      {formatMoney(
                        sales[id].sale.total_amount -
                          sales[id].sale.total_sale_fee
                      )}
                    </p>
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default ItemsDetailsComplete;
