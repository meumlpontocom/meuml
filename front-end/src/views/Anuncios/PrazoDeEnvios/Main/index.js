/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Button,
  Row,
  Col,
  CardBody,
  Card,
  CardFooter,
  CardHeader,
} from "reactstrap";
import { useState } from "react";
import { fetchApi } from "./fetch";
import Loading from "react-loading";
import { Input } from "reactstrap/lib";
import { useSelector } from "react-redux";
import { BoxHeaderFooter } from "./styles";
import { useForm, Controller } from "react-hook-form";
import SelectedAdsAmount from "../../PrecoEmMassa/HeaderComp";
import Swal from "sweetalert2";
import ModalNoPermission from "../../../../components/ModalNoPermission";

export default function MainDescription({ history }) {
  const [loading, setLoading] = useState(false);
  const { errors, control, handleSubmit } = useForm({});
  const [showTip, setShowTip] = useState(false);
  const selectedAds = useSelector(state => state.selectedAdverts);
  const advertsUrl = useSelector(state => state.advertsURL);
  const [openModal, setOpenModal] = useState(false);

  const accounts = useSelector(state => {
    let accountComp = [];
    Object.values(state.accounts.accounts).forEach(account => {
      if (account.permissions) {
        accountComp.push({
          name: account.name,
          id: account.id,
          permission: account.permissions.modules_id && account.permissions.modules_id.find(i => i === 6),
        });
      }
    });
    const newArr = [];

    Object.values(state.selectedAdverts.advertsArray)
      .map(acc => accountComp.filter(account => account.id === acc.account_id && acc.checked))
      .map(item => item[0])
      .filter(item => item !== undefined)
      .map(item => {
        newArr.indexOf(item) === -1 && newArr.push(item);
        return item;
      });
    return newArr;
  });

  const noPermission = useMemo(() => {
    return accounts.filter(item => item.permission !== 6).map(item => item.name);
  }, [accounts]);

  useEffect(() => {
    if (!Object.keys(selectedAds.advertsArray).length && !selectedAds.allChecked) history.push("/anuncios");
  }, [history, selectedAds.advertsArray]);

  function onSubmit(data) {
    setOpenModal(false);
    if (selectedAds.allChecked) {
      Swal.fire({
        title: "Atenção",
        type: "info",
        html: "<p>Esta alteração será aplicada apenas a anúncios ativos e pausados.</p>",
        showCloseButton: true,
      }).then(user => {
        const ads = { ...selectedAds };
        if (user.value) fetchApi(data, setLoading, ads, advertsUrl, history);
      });
    } else {
      const allowedAds = Object.values(selectedAds.advertsArray).filter(
        ad => ad.status === "paused" || ad.status === "active",
      );
      const ads = allowedAds.filter(ad => ad.checked).map(ad => ad.id);
      return ads.length
        ? fetchApi(data, setLoading, ads, advertsUrl, history)
        : Swal.fire({
            title: "Atenção",
            type: "warning",
            html: "<p>Você pode aplicar estas alterações apenas em anúncios ativos e pausados.</p>",
            showCloseButton: true,
          }).then(() => history.push("/anuncios"));
    }
  }

  const DaysInput = ({ icon, title, errorFocus, ...rest }) => (
    <>
      <label htmlFor={rest.id}>{rest.label}</label>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText style={{ justifyContent: "center" }}>
            <i className={`cil-${icon}`} />
          </InputGroupText>
        </InputGroupAddon>
        <Input type="number" {...rest} onFocus={() => setShowTip(true)} />
      </InputGroup>
    </>
  );
  return (
    <BoxHeaderFooter>
      <Card className="card-accent-primary">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="container">
            {loading ? (
              <div className="row justify-content-center mt-4">
                <Loading type="spinningBubbles" color="#054785" height={150} width={100} />
              </div>
            ) : (
              <>
                <CardHeader>
                  <SelectedAdsAmount selectedAds={selectedAds} />
                </CardHeader>
                <CardBody>
                  <Row style={{ justifyContent: "center", padding: "8px 14px" }}>
                    <Col xs={8}>
                      <Controller
                        as={
                          <DaysInput
                            icon="calendar-check mr-1"
                            id="manufacturing-time-input"
                            name="numberOfDays"
                            label={
                              <span>
                                Número de dias{" "}
                                <small>(máximo de 45 dias. Utilize 0 para excluir o prazo.)</small>
                              </span>
                            }
                            title="Número de dias para o prazo de envio do(s) produto(s)"
                            placeholder="Prazo de Envio do(s) produto(s)"
                            errorFocus={errors.header}
                            max="45"
                            min="0"
                          />
                        }
                        control={control}
                        name="days"
                        defaultValue=""
                      />
                      {showTip ? (
                        <small className="animated fadeIn" style={{ color: "#35A6FF" }}>
                          Dica: informe um número de dias corridos, e não de dias úteis.
                        </small>
                      ) : (
                        <></>
                      )}
                    </Col>
                  </Row>
                </CardBody>
                <CardFooter className="mt-2">
                  <Row>
                    <Col xs={12} sm={6} justify="flex-end">
                      <Button
                        type="button"
                        onClick={() => history.push("/anuncios")}
                        style={{ minWidth: 165 }}
                      >
                        <i className="cil-x" /> Cancelar
                      </Button>
                    </Col>
                    <Col className="text-left" xs={12} sm={6}>
                      {!noPermission?.length ? (
                        <Button color="primary" type="submit" style={{ minWidth: 165 }}>
                          <i className="cil-check" /> Executar
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          type="button"
                          onClick={() => {
                            setOpenModal(true);
                          }}
                          style={{ minWidth: 165 }}
                        >
                          <i className="cil-check" /> Executar
                        </Button>
                      )}
                    </Col>
                  </Row>
                </CardFooter>
                <ModalNoPermission
                  openModal={openModal}
                  noPermission={noPermission}
                  closeModal={() => setOpenModal(false)}
                  sendButton={handleSubmit(onSubmit)}
                ></ModalNoPermission>
              </>
            )}
          </div>
        </form>
      </Card>
    </BoxHeaderFooter>
  );
}
