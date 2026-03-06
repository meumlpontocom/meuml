/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo } from "react";
import { Input } from "reactstrap/lib";
import { useForm, Controller } from "react-hook-form";
import { BoxHeaderFooter } from "./styles";
import { InputGroup, InputGroupAddon, InputGroupText, Button } from "reactstrap";
import { useSelector } from "react-redux";
import { useState } from "react";
import Loading from "react-loading";
import { fetchApi } from "./fetch";
import SelectedAdsAmount from "../../PrecoEmMassa/HeaderComp";
import ModalNoPermission from "../../../../components/ModalNoPermission";

export default function MainDescription({ history }) {
  const [loading, setLoading] = useState(false);
  const { errors, control, handleSubmit } = useForm({});

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

  const TextArea = ({ icon, title, errorFocus, ...rest }) => (
    <InputGroup>
      <InputGroupAddon addonType="prepend">
        <InputGroupText>
          <i className={icon} />
          <p>{title}</p>
        </InputGroupText>
      </InputGroupAddon>
      <Input type="textarea" required rows="5" {...rest}></Input>
    </InputGroup>
  );

  return (
    <BoxHeaderFooter>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="container">
          <SelectedAdsAmount selectedAds={selectedAds}></SelectedAdsAmount>

          {loading ? (
            <div className="row justify-content-center mt-4">
              <Loading type="spinningBubbles" color="#054785" height={150} width={100} />
            </div>
          ) : (
            <>
              <div className="col-12 mb-2 mt-2">
                <Controller
                  as={
                    <TextArea
                      icon="fa fa-pencil-square-o mr-1"
                      title="Substituir texto"
                      placeholder="Digite aqui a parte da descrição que deseja substituir"
                      errorFocus={errors.header}
                    />
                  }
                  control={control}
                  name="replace_from"
                  defaultValue=""
                ></Controller>
              </div>

              <div className="col-12 mb-2 mt-2">
                <Controller
                  as={
                    <TextArea
                      icon="fa fa-pencil-square-o mr-1"
                      title="Substituir para"
                      placeholder="Digite aqui o novo texto da descrição"
                      errorFocus={errors.header}
                    />
                  }
                  control={control}
                  name="replace_to"
                  defaultValue=""
                ></Controller>
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
    </BoxHeaderFooter>
  );
}
