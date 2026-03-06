/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import api from "../../services/api";
import PageChange from "./PageChange";
import { BoxHistory, Td } from "./styles";
import { Table, Row, Card } from "reactstrap";
import { getToken } from "../../services/auth";
import formatMoney from "../../helpers/formatMoney";
import LoadPageHandler from "../../components/Loading";

export default function HistoricoPlano() {
  const [loading, setLoading] = useState(true);
  const [extract, setExtract] = useState({});
  const [meta, setMeta] = useState({
    limit: "50",
    total: "1",
    page: "1",
  });
  async function fetchExtract() {
    try {
      const { data } = await api.get(`credits/extract?page=1`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return data;
    } catch (error) {
      if (error.response) {
        return error.response;
      }
      return error;
    }
  }
  function handleExtractData(data) {
    return {
      data: data.map(item => ({
        ...item,
        totalFormatted: formatMoney(item.amount),
        dateFormat: format(new Date(item.date_created), "dd/MM/yyyy"),
      })),
      meta: data.meta,
    };
  }
  async function handleFetch() {
    try {
      await fetchExtract().then(response => {
        if (response.status === "success" && response.data) {
          if (response.meta) {
            setMeta(response.meta);
          }
          const data = handleExtractData(response.data);
          setExtract({ ...data });
        }
        if (response.message !== "NM") {
          Swal.fire({
            title: "Atenção!",
            type: "info",
            showCloseButton: true,
            html: `<p>${response.message}</p>`,
          });
        }
      });
    } catch (error) {
      return error;
    } finally {
      setLoading(false);
    }
  }
  async function paginate(page) {
    try {
      setLoading(true);
      const { data } = await api.get(`credits/extract?page=${page}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const _data = handleExtractData(data);
      setExtract({ ..._data });
    } catch (error) {
      if (error.response) {
        Swal.fire({
          title: "Ops!",
          html: `<p>${error.response.data.message}</p>`,
          type: "warning",
          showCloseButton: true,
        });
        return error.response;
      }
      return error;
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <>
      <BoxHistory>
        {loading ? (
          <LoadPageHandler />
        ) : (
          <>
            {extract.data ? (
              <Card className="card-accent-secondary">
                <Row className="table-box">
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Valor</th>
                          <th>Pedido</th>
                          <th>Data do pedido</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extract.data.map(list => (
                          <tr key={list.item_external_id}>
                            <Td>
                              <p>{list.totalFormatted}</p>
                            </Td>
                            <Td>
                              <p>{list.task}</p>
                            </Td>
                            <Td>
                              <p>{list.dateFormat}</p>{" "}
                            </Td>
                            <Td status="rgb(220, 7, 7)">Cancelado</Td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    <PageChange
                      changePage={paginate}
                      limit={meta.limit}
                      total={meta.total}
                      page={meta.page}
                    />
                  </div>
                </Row>
              </Card>
            ) : (
              <h5 style={{ marginTop: "16em", fontSize: "14px" }} className="text-center">
                <i className="cil-magnifying-glass" /> Ops...parece que não há nada por aqui.
              </h5>
            )}
          </>
        )}
      </BoxHistory>
    </>
  );
}
