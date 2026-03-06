/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo } from "react";
import { useForm, Controller, ErrorMessage } from "react-hook-form";
import { BoxPrice } from "./styles";
import { MonetaryFormate, PercentFormate } from "../../../../components/FormatComponent";
import { Button } from "reactstrap";
import { useSelector } from "react-redux";
import { useState } from "react";
import { validationDiscount } from "./validation";
import Loading from "react-loading";
import SelectedAdsAmount from "../HeaderComp";
import { fetchApi } from "./fetch";
import ModalNoPermission from "../../../../components/ModalNoPermission";

export default function MainPrice({ history }) {
  const [loading, setLoading] = useState(false);
  const { errors, control, handleSubmit, register, watch } = useForm({
    defaultValues: {
      moreOrLess: "Baixar",
      price_rate: "0",
    },
    mode: "onBlur",
    validateCriteriaMode: "firstError",
    validationSchema: validationDiscount,
  });
  const values = useMemo(() => {
    return watch(["moreOrLess", "price_rate"]);
  }, [watch]);

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

  const allChecked = useMemo(() => {
    return selectedAds.allChecked;
  }, [selectedAds]);

  useEffect(() => {
    if (!Object.keys(selectedAds.advertsArray).length && !allChecked) history.push("/anuncios");
  }, [history, selectedAds.advertsArray]);

  async function onSubmit(data) {
    setOpenModal(false);
    await fetchApi(data, setLoading, selectedAds, advertsUrl, history);
  }

  return (
    <BoxPrice container justify="center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container">
          <SelectedAdsAmount></SelectedAdsAmount>

          {loading ? (
            <div className="row justify-content-center mt-4">
              <Loading type="spinningBubbles" color="#054785" height={150} width={100} />
            </div>
          ) : (
            <>
              <div className="row mt-2 justify-content-center">
                <div className="col-12 col-sm-2">
                  <label htmlFor="radio1">
                    <input id="radio1" type="radio" name="moreOrLess" value="Subir" ref={register} /> Subir
                    preço
                  </label>
                </div>
              </div>
              <div className="row mb-2 justify-content-center">
                <div className="col-12 col-sm-2">
                  <label for="radio2">
                    <input id="radio2" type="radio" name="moreOrLess" value="Baixar" ref={register} /> Baixar
                    preço
                  </label>
                </div>
              </div>
              <div className="row mt-2 justify-content-center">
                <div className="col-12 col-sm-2">
                  <label for="radio3">
                    <input id="radio3" type="radio" name="price_rate" value="1" ref={register} /> Porcentagem
                  </label>
                </div>
              </div>
              <div className="row mb-2 justify-content-center">
                <div className="col-12 col-sm-2">
                  <label for="radio4">
                    <input id="radio4" type="radio" name="price_rate" value="0" ref={register} /> Valor
                  </label>
                </div>
              </div>

              {values.price_rate === "1" && (
                <div className="row justify-content-center">
                  <div className="col-12 col-sm-5">
                    <Controller
                      as={
                        <PercentFormate
                          title={`${values.moreOrLess}`}
                          placeholder="% no preço de todos os anúncios"
                        ></PercentFormate>
                      }
                      onChange={event => event[0]}
                      control={control}
                      name="price_percent"
                      defaultValue=""
                    ></Controller>
                    <ErrorMessage errors={errors} as={<span className="error"></span>} name="price_percent" />
                  </div>
                </div>
              )}

              {values.price_rate === "0" && (
                <div className="row justify-content-center">
                  <div className="col-12 col-sm-5">
                    <Controller
                      as={
                        <MonetaryFormate
                          title={`${values.moreOrLess}`}
                          placeholder="Valor no preço de todos os anúncios"
                        ></MonetaryFormate>
                      }
                      onChange={event => event[0]}
                      control={control}
                      name="price_real"
                      defaultValue=""
                    ></Controller>
                    <ErrorMessage errors={errors} as={<span className="error"></span>} name="price_real" />
                  </div>
                </div>
              )}

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
