import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import { ContainerNews } from "./styles";
import MassChanges from "../../components/AdMassChanges";
import api from "../../services/api";
import Loading from "react-loading";
import { toast } from "react-toastify";
import { getToken } from "../../services/auth";
import { Picky } from "react-picky";
import ButtonComponent from "src/components/ButtonComponent";
import ReactHtmlParser from "react-html-parser";

export default function News({ history }) {
  const [data, setData] = useState({ data: [] });
  const [accounts, setAccounts] = useState({
    selects: [],
    nameId: [],
    selecteds: [],
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const {
          data: { data },
        } = await api.get("/accounts");

        setAccounts({
          selects: data?.filter(item => item.platform === "ML").map(item => item.name),
          nameId: data
            ?.filter(item => item.platform === "ML")
            .map(item => ({ id: item.id, name: item.name })),
          selecteds: [],
        });

        const response = await api.get("/communications/notices");

        setData({
          ...response.data,
          data: Object.entries(response.data.data)?.map(item => {
            return {
              ...item[1],
              id: item[0],
              name: [
                ...data
                  ?.filter(account => {
                    return Number(item[0], 10) === account.id;
                  })
                  ?.map(nam => nam.name),
              ],
            };
          }),
        });
      } catch (error) {
        toast.error(error.response.data.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function handleFilter(data) {
    setAccounts({ ...accounts, selecteds: data });
  }

  async function sendFilter() {
    const selects = accounts.selecteds.map(item =>
      accounts.nameId
        .filter(selected => {
          return selected.name === item;
        })
        .map(item => item.id),
    );
    try {
      setLoading(true);
      const {
        data: { data },
      } = await api.get("/accounts", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setAccounts({
        ...accounts,
        selects: data?.map(item => item.name),
        nameId: data?.map(item => ({ id: item.id, name: item.name })),
      });
      const response = await api.get(`/communications/notices?account_id=${selects.join(",")}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setData({
        ...response.data,
        data: Object.entries(response.data.data)?.map(item => {
          return {
            ...item[1],
            id: item[0],
            name: [
              ...data
                ?.filter(account => {
                  return Number(item[0], 10) === account.id;
                })
                ?.map(nam => nam.name),
            ],
          };
        }),
      });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Col className="mb-3" sm="12" md="6" lg="6" xs="12">
        <Row>
          <Col>
            <Picky
              onChange={handleFilter}
              value={accounts.selecteds}
              options={accounts.selects}
              open={false}
              multiple={true}
              labelKey="external_name"
              valueKey="id"
              includeFilter={true}
              dropdownHeight={600}
              includeSelectAll={true}
              placeholder="Filtrar por conta(s)"
              selectAllText="Selecionar Todos"
              filterPlaceholder="Filtrar por conta(s)"
              allSelectedPlaceholder="Todos (%s)"
              manySelectedPlaceholder="%s selecionadas"
            />
          </Col>
          <Col style={{ marginTop: "3px" }}>
            <ButtonComponent
              onClick={sendFilter}
              disabled={accounts.selecteds.length === 0}
              icon="cil-filter"
              title="Filtrar"
              variant=""
              width="80px"
            />
          </Col>
        </Row>
      </Col>
      <ContainerNews>
        <MassChanges title="Novidades" style={{ color: "#20a8d8" }}>
          {loading ? (
            <div className="loading-div">
              <Loading type="spinningBubbles" color="#054785" height={150} width={100} />
            </div>
          ) : (
            <div className="overflow-container">
              {data.data.length > 0 ? (
                data.data?.map(news => {
                  return (
                    <Row key={news.id} className="white-bg">
                      <Col xs={12} className="title-news" style={{ textAlign: "start" }}>
                        {!!news.name.length && `Conta ML: ${news.name}`}
                      </Col>
                      {news.notices.map(notice => {
                        return (
                          <Row className="mb-1" key={notice.id} style={{ width: "100%" }}>
                            <Col xs={12} sm="1">
                              <i className="cil-bullhorn text-secondary" style={{ fontSize: "32px" }}></i>
                            </Col>
                            <Col xs="12" sm="7">
                              <div className="title-news mb-1">{notice.label}</div>
                              <div className="sub-news">{ReactHtmlParser(notice.description)}</div>
                            </Col>
                            <Col xs="12" sm="3" className="link-news">
                              {notice.actions?.map(action => {
                                return (
                                  <a
                                    key={action.text}
                                    href={action.link}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                  >
                                    {action.text}
                                  </a>
                                );
                              })}
                            </Col>
                          </Row>
                        );
                      })}
                    </Row>
                  );
                })
              ) : (
                <div className="loading-div">{data.message}</div>
              )}
            </div>
          )}
        </MassChanges>
      </ContainerNews>
    </>
  );
}
