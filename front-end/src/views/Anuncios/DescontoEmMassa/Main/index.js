/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo } from "react";
import { Input } from "reactstrap/lib";
import { useForm, Controller, ErrorMessage } from "react-hook-form";
import { BoxPrice } from "./styles";
import { PercentFormate } from "../../../../components/FormatComponent";
import { InputGroup, InputGroupAddon, InputGroupText, Button } from "reactstrap";
import { useSelector } from "react-redux";
import { useState } from "react";
import { validationDiscount } from "./validation";
import Loading from "react-loading";
import { fetchApi } from "./fetch";
import SelectedAdsAmount from "../../PrecoEmMassa/HeaderComp";
import ModalNoPermission from "../../../../components/ModalNoPermission";

export default function MainDiscount({ history }) {
  const [loading, setLoading] = useState(false);
  const { errors, control, handleSubmit } = useForm({
    mode: "onBlur",
    validateCriteriaMode: "firstError",
    validationSchema: validationDiscount,
  });

  const selectedAds = useSelector(state => state.selectedAdverts);
  const advertsUrl = useSelector(state => state.advertsURL);
  const allChecked = useMemo(() => {
    return selectedAds.allChecked;
  }, [selectedAds]);

  useEffect(() => {
    if (!Object.keys(selectedAds.advertsArray).length && !allChecked) history.push("/anuncios");
  }, [history, selectedAds.advertsArray]);

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

  async function onSubmit(data) {
    setOpenModal(false);
    await fetchApi(data, setLoading, selectedAds, advertsUrl, history);
  }

  const DateInput = ({ className, title, icon, ...rest }) => (
    <InputGroup className={className}>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <i className={`cil-${icon} mr-1`} />
          <span>{title}</span>
        </InputGroupText>
      </InputGroupAddon>
      <Input type="datetime-local" {...rest}></Input>
    </InputGroup>
  );

  return (
    <BoxPrice>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container">
          <SelectedAdsAmount></SelectedAdsAmount>

          {loading ? (
            <div className="row justify-content-center mt-4">
              <Loading type="spinningBubbles" color="#054785" height={150} width={100} />
            </div>
          ) : (
            <>
              <div xs={12} className="row mt-4 mb-2 justify-content-center">
                <div className="col-12 col-sm-6">
                  <Controller
                    as={<DateInput icon="calendar" title="Data de início"></DateInput>}
                    control={control}
                    name="start_date"
                    defaultValue="10/12/12 14:55"
                  ></Controller>
                  <ErrorMessage errors={errors} as={<span className="error"></span>} name="start_date" />
                </div>
              </div>
              <div xs={12} className="row justify-content-center mb-2">
                <div className="col-12 col-sm-6">
                  <Controller
                    as={<DateInput icon="calendar-check" title="Data de fim"></DateInput>}
                    control={control}
                    name="finish_date"
                    defaultValue="10/12/12 11:55"
                  ></Controller>
                  <ErrorMessage errors={errors} as={<span className="error"></span>} name="finish_date" />
                </div>
              </div>

              <div className="row justify-content-center">
                <div className="col-12 col-sm-6 ">
                  <Controller
                    as={
                      <PercentFormate
                        placeholder="Desconto em %"
                        footer="Valor"
                        title="Desconto (%)"
                      ></PercentFormate>
                    }
                    onChange={event => event[0]}
                    control={control}
                    name="buyers_discount_percentage"
                    defaultValue=""
                  ></Controller>
                  <ErrorMessage
                    errors={errors}
                    as={<span className="error"></span>}
                    name="buyers_discount_percentage"
                  />
                </div>
              </div>
              <div className="row mt-2 justify-content-center">
                <div className="col-12 col-sm-6">
                  <Controller
                    as={
                      <PercentFormate
                        title="Desconto Nível > 3"
                        placeholder="Desconto em %"
                        footer="Valor"
                      ></PercentFormate>
                    }
                    onChange={event => event[0]}
                    control={control}
                    name="best_buyers_discount_percentage"
                    defaultValue=""
                  ></Controller>
                  <ErrorMessage
                    errors={errors}
                    as={<span className="error"></span>}
                    name="best_buyers_discount_percentage"
                  />
                </div>
              </div>
              <div className="row justify-content-center">
                <div className="col-12 col-sm-6" style={{ textAlign: "center" }}>
                  <small>(Opcional, para compradores com nível maiores que 3 no Mercado Pontos)</small>
                </div>
              </div>

              <div className="row mt-4 button-painel ">
                <div xs={12} sm={6} className="row col-12 col-sm-6 justify-content-end">
                  <Button type="button" onClick={() => history.push("/anuncios")} style={{ minWidth: 165 }}>
                    <i className="cil-x" /> Cancelar
                  </Button>
                </div>
                <div className="row col-12 col-sm-6" justify="flex-start">
                  {!noPermission.length ? (
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
                </div>
              </div>
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
    </BoxPrice>
  );
}
