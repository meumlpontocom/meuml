/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../../services/api";
import { getToken } from "../../services/auth";
import { Card, CardHeader, CardBody, Table, Container, CardFooter } from "reactstrap";
import formatMoney from "../../helpers/formatMoney";
import LoadPageHandler from "../../components/Loading";
import Pagination from "react-js-pagination";

export default function HistoricoAssinatura() {
  const [historic, setHistoric] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("date_modified");
  const [sortOrder, setSortOrder] = useState("desc");
  const [meta, setMeta] = useState({
    first_page: 1,
    last_page: 1,
    limit: 50,
    next_page: 2,
    offset: 0,
    page: 1,
    pages: 2,
    previous_page: 0,
    total: 1,
  });
  const fetchExtract = async page => {
    try {
      setLoading(true);
      const url = `/payments/orders?page=${page}&limit=${meta.limit}&sort_name=${filter}&sort_order=${sortOrder}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (response.data.status === "success") {
        const historicData = Array.isArray(response.data.data) ? [...response.data.data] : [];
        const metaData = response.data.meta ?? meta;

        setHistoric(historicData);
        setMeta(metaData);
        return historicData;
      }
    } catch (error) {
      if (error.response) {
        return error.response;
      }
      Swal.fire({
        title: "Oops, algo deu errado!",
        type: "error",
        html: `<p>${error}</p>`,
        showCloseButton: true,
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = page => {
    if (page !== meta.page) {
      fetchExtract(page);
    }
  };
  const handleFilter = filterString => {
    setFilter(filterString);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    fetchExtract(1);
  };
  useEffect(() => {
    fetchExtract(1);
  }, []);
  return (
    <LoadPageHandler
      isLoading={loading}
      render={
        <Container className="animated fadeIn">
          <Card className="card-accent-primary">
            <CardHeader style={{ color: "#20A8D8" }}>
              <h4 className="page-title">{"Histórico de Compras".toUpperCase()}</h4>
            </CardHeader>
            <CardBody>
            {
              !historic.length ? 
                <div> Você ainda não possui compras </div> 
              :
              <Table hover className="table table-responsive-sm table-bordered table-striped table-sm">
                <thead>
                  <tr>
                    <th className="tbcol-10 text-center order-column" onClick={() => handleFilter("id")}>
                      <i className="cil-caret-bottom mr-1" />
                      ID
                      <i className="cil-caret-top ml-1" />
                    </th>
                    <th className="tbcol-15 text-center">Descrição</th>
                    <th
                      className="tbcol-10 text-center order-column"
                      onClick={() => handleFilter("total_price")}
                    >
                      <i className="cil-caret-bottom mr-1" />
                      Valor
                      <i className="cil-caret-top ml-1" />
                    </th>
                    <th
                      className="tbcol-10 text-center order-column"
                      onClick={() => handleFilter("date_modified")}
                    >
                      <i className="cil-caret-bottom mr-1" />
                      Data
                      <i className="cil-caret-top ml-1" />
                    </th>
                    <th className="tbcol-10 text-center">Tipo</th>
                    <th className="tbcol-10 text-center">Status</th>
                  </tr>
                </thead>
                  <tbody>
                  {
                    historic.map((transaction, index) => {
                      return (
                        <tr key={index}>
                          <td className="text-center">{transaction.id}</td>
                          <td className="text-center">{transaction.message ? transaction.message : "N / A"}</td>
                          <td className="text-center">{formatMoney(transaction.price)}</td>
                          <td className="text-center">
                            {new Date(transaction.date_modified).toLocaleDateString("pt-BR")}
                          </td>
                          <td className="text-center">
                            {transaction.url ? (
                              <a
                                id="link-boleto"
                                name="link-boleto"
                                href={transaction.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {transaction.payment_type}
                              </a>
                            ) : (
                              transaction.payment_type
                            )}
                          </td>
                          <td
                            className={`text-center ${
                              transaction.payment_status === "Pendente"
                                ? "bg-warning"
                                : transaction.payment_status === "Confirmado"
                                ? "bg-success"
                                : "bg-danger"
                            }`}
                          >
                            {transaction.payment_status}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
              </Table>
            }
            </CardBody>
              <CardFooter>
              <Pagination
                activePage={meta.page}
                itemsCountPerPage={meta.limit}
                totalItemsCount={meta.total}
                pageRangeDisplayed={5}
                onChange={handlePageChange}
                itemClass="btn btn-md btn-outline-info"
                activeClass="btn btn-md btn-info"
                innerClass="btn-group"
                activeLinkClass="text-white"
              />
              </CardFooter>
          </Card>
        </Container>
      }
    />
  );
}
