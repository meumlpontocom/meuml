/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./index.scss";
import inputs from "./inputs";
import Requests from "./requests";
import DynamicInput from "./inputs/DynamicInput";
import UpdatePictures from "./UpdatePictures";
import LoadPageHandler from "src/components/Loading";
import { CButton, CCard, CCardBody, CCardHeader, CCol, CRow } from "@coreui/react";
import context, { Provider } from "./UpdateAdvert.Context";
import Attributes from "./Attributes";
import { Link } from "react-router-dom";

function AdvertisingUpdate({ location, history }) {
  const [isLoading, setIsLoading] = useState(false);
  const [advertData, setAdvertData] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [advertMainInfo, setAdvertMainInfo] = useState({});
  const [showVariationsWarning, setShowVariationsWarning] = useState(false);

  const VariationsWarningMessage = ({ header }) => {
    return showVariationsWarning ? (
      <CCard className="card text-white bg-warning mb-3">
        {header ? (
          <CCardHeader>
            <h4>Atenção!</h4>
          </CCardHeader>
        ) : (
          <></>
        )}
        <CCardBody>
          <p className="card-text">
            Este anúncio possui variações! Entretanto, esta ferramenta&nbsp;
            <strong>ainda não pode</strong> trabalhar com tais condições. Por favor, edite aqui{" "}
            <strong>apenas anúncios sem variações</strong>.
          </p>
          <Link to="/anuncios" className="text-white">
            <u>Clique aqui para voltar</u>
          </Link>
        </CCardBody>
      </CCard>
    ) : (
      <></>
    );
  };

  const saveAdvertMainInfo = useCallback(ref => {
    setAdvertMainInfo(previous => {
      return { ...previous, [ref.current.id]: ref };
    });
  }, []);

  const updateFormData = ({ param, value }) => {
    setFormData(previous => {
      return { ...previous, [param]: value };
    });
  };

  const request = new Requests(setIsLoading, location.state?.advertId, history);

  useEffect(() => {
    !location.state?.advertId && history.goBack();
    return () => history;
  }, [history, location.state]);

  useEffect(() => {
    const cleanup = request.fetchAdvertisingData().then(response => {
      if (response) {
        setAdvertData(() => response);
        if (response.variations.length) {
          setShowVariationsWarning(true);
        }
      }
      return response;
    });
    return () => cleanup;
  }, []);

  const advertAttributes = useMemo(() => {
    return advertData?.attributes
      ? advertData.attributes.filter(attribute => !attribute.tags["hidden"])
      : undefined;
  }, [advertData]);

  const advertPictures = useMemo(() => {
    return advertData?.pictures ? advertData.pictures : [];
  }, [advertData]);

  const setNewPicturesCallback = useCallback(
    picturesToAdd => {
      setAdvertData(advertising => {
        return Object.assign({}, advertising, {
          pictures: [...advertising.pictures, ...picturesToAdd],
        });
      });
    },
    [setAdvertData],
  );

  const updateActiveIndex = useCallback(
    index => {
      if (index < advertData?.pictures?.length && index >= 0) {
        setActiveIndex(() => index);
      }
    },
    [setActiveIndex, advertData],
  );

  const removePicture = useCallback(() => {
    setAdvertData(previous => {
      return Object.assign({}, previous, {
        pictures: previous.pictures.filter((_, index) => index !== activeIndex),
      });
    });

    updateActiveIndex(activeIndex - 1);
  }, [updateActiveIndex, activeIndex]);

  const makeDefaultValue = (advert, key) => {
    switch (key) {
      case "description":
        return advert.description.plain_text;

      case "sale_terms_manufacturing_time":
        return advert.sale_terms.filter(obj => obj.id === "MANUFACTURING_TIME")[0]?.value_name || "";

      case "sale_terms_warranty_type":
        return advert.sale_terms.filter(obj => obj.id === "WARRANTY_TYPE")[0]?.value_name || "";

      case "sale_terms_warranty_time":
        return advert.sale_terms.filter(obj => obj.id === "WARRANTY_TIME")[0]?.value_name || "";

      case "shipping":
        return advert[key].free_shipping;

      default:
        return advert[key];
    }
  };

  const list = useMemo(() => {
    if (advertData.editable_fields?.length) {
      const d = advertData.editable_fields.filter(field => field === "description");
      const n = advertData.editable_fields.filter(field => field !== "description");
      return [...n, ...d];
    }
    return [];
  }, [advertData]);

  return (
    <Provider
      value={{
        request,
        isLoading,
        activeIndex,
        pictures: advertPictures,
        visibleAttributeList: advertAttributes,
        accountId: location.state?.accountId,
        formData,
        updateFormData,
        removePicture,
        saveAdvertMainInfo,
        advertMainInfo,
        updateActiveIndex: newIndex => updateActiveIndex(newIndex),
        setAdvertPictures: picturesToAdd => setNewPicturesCallback(picturesToAdd),
      }}
    >
      <LoadPageHandler
        isLoading={isLoading}
        render={
          <>
            <CCard>
              <CCardHeader>
                <h1>
                  Editar Anúncio{" "}
                  <a href={location.state?.permalink} target="_blank" rel="noopener noreferrer">
                    {location.state?.advertId}
                  </a>
                </h1>
              </CCardHeader>
            </CCard>
            <VariationsWarningMessage header />
            <CCard>
              <CCardBody>
                <UpdatePictures />
              </CCardBody>
            </CCard>
            <CCard>
              <CCardBody>
                <CRow>
                  {list.length ? (
                    list.map((field, index) => {
                      return inputs[field] ? (
                        <DynamicInput
                          context={context}
                          key={index}
                          name={field}
                          id={`${field}-input`}
                          type={inputs[field].type}
                          icon={inputs[field].icon}
                          label={inputs[field]?.label || ""}
                          defaultValue={makeDefaultValue(advertData, field)}
                          columns={
                            field === "description"
                              ? { xs: 12 }
                              : {
                                  xs: 12,
                                  sm: 12,
                                  md: 6,
                                  lg: 6,
                                  xl: 6,
                                  xxl: 4,
                                }
                          }
                        />
                      ) : (
                        <React.Fragment key={index} />
                      );
                    })
                  ) : (
                    <React.Fragment key={Math.random()} />
                  )}
                </CRow>
              </CCardBody>
            </CCard>
            <Attributes />
            {showVariationsWarning ? (
              <VariationsWarningMessage />
            ) : (
              <CRow className="mb-5">
                <CCol>
                  <CButton
                    onClick={() => window.location.assign("/#/anuncios")}
                    color="secondary"
                    className="float-left"
                  >
                    <i className="cil-arrow-left mr-1" />
                    Voltar
                  </CButton>
                </CCol>
                <CCol>
                  <CButton
                    color="success"
                    className="float-right"
                    onClick={() =>
                      request.updateAdvertising({
                        formData,
                        advertMainInfo,
                        advertPictures,
                      })
                    }
                  >
                    <i className="cil-check-circle mr-1" />
                    Salvar
                  </CButton>
                </CCol>
              </CRow>
            )}
          </>
        }
      />
    </Provider>
  );
}

export default AdvertisingUpdate;
