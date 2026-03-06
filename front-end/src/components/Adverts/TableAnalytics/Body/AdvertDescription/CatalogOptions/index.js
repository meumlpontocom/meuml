import React from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import VariationInput from "./VariationInput";
import { getToken } from "../../../../../../services/auth";
import withReactContent from "sweetalert2-react-content";
import { Container, Col, Row, Input, Label } from "reactstrap";
import { toast } from "react-toastify";

const alertError = (error) => (
  Swal.fire({
    title: "Atenção",
    type: "error",
    text: error.response?.data?.message || error.message,
    showCloseButton: true,
  })
)

CatalogOptions.propTypes = {
  externalData: PropTypes.object,
  title: PropTypes.string,
  advertID: PropTypes.string,
};

export default function CatalogOptions({
  externalData,
  title,
  advertID,
  price,
}) {
  const ReactSwal = withReactContent(Swal);
  const callForm = async () => {
    try {
      if (externalData.eligible) {
        const selectedVariations = await ReactSwal.fire({
          showConfirmButton: true,
          showCancelButton: true,
          cancelButtonText: "Cancelar",
          confirmButtonText: "Adicionar ao catálogo ML",
          disableConfirmButton:
            externalData.variations.length === 0 ? true : false,
          customClass: {
            content: "popupConentAlign",
            confirmButton: "btn btn-primary mr-2",
            cancelButton: "mr-5",
          },
          html: (
            <Container
              id="catalogOptionsPopup"
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "0 0",
              }}
            >
              <Col sm="12" md="12" lg="12" xs="12" style={{ padding: "0 0" }}>
                <Row>
                  <Col sm="2" md="2" lg="2" xs="2">
                    <img
                      src={externalData.secure_thumbnail}
                      alt="Imagem do anúncio"
                    />
                  </Col>
                  <Col sm="10" md="10" lg="10" xs="10">
                    <span
                      style={{
                        fontSize: 16,
                        margin: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      {title}
                    </span>
                    <br />
                    <span
                      style={{
                        fontSize: 12,
                        margin: "10px",
                        color: "#0011223377",
                      }}
                    >
                      ID: {advertID}
                    </span>{" "}
                    <span
                      style={{
                        fontSize: 12,
                        margin: "10px",
                        color: "#0011223377",
                      }}
                    >
                      {price.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </Col>
                </Row>
              </Col>
              <Col sm="12" md="12" lg="12" xs="12" style={{ padding: "0 0" }}>
                {externalData.variations.length > 0 ? (
                  <Col
                    sm="12"
                    md="12"
                    lg="12"
                    xs="12"
                    style={{
                      marginBottom: "25px",
                      marginTop: "25px",
                      padding: "0 0",
                    }}
                  >
                    <h5>
                      Selecione as variações que deseja incluir no catálogo:{" "}
                    </h5>
                  </Col>
                ) : null}
                <div
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    maxHeight: "220px",
                    textAlign: "center",
                  }}
                >
                  <VariationInput
                    advertName={title}
                    externalData={externalData}
                  />
                </div>
              </Col>
              <Col
                className="form-check"
                sm="12"
                md="12"
                lg="12"
                xs="12"
                style={{ fontSize: 10 }}
              >
                <hr />
                <Input
                  className="form-check-input"
                  type="checkbox"
                  id="termsOfUse"
                />
                <Label className="form-check-label mt-1">
                  Eu aceito fazer a publicação em catálogo com os dados
                  mencionados acima.
                </Label>
              </Col>
            </Container>
          ),
          preConfirm: () => {
            const selectedAds = document.querySelectorAll("#checkBox");
            const termsOfUse = document.querySelector("#termsOfUse");
            if (termsOfUse.checked) return selectedAds;
            toast("Você deve aceitar os termos de uso para prosseguir.", {
              type: "warning",
              closeOnClick: false,
              autoClose: 5000,
              position: "top-center",
            });
            return false;
          },
        })
        let variationsIds = [];
        for (const checkbox of selectedVariations.value) {
          if (checkbox.checked) variationsIds.push(checkbox.value);
        }
        handleSelectedVariation(variationsIds);
      }
    } catch (error) {
      alertError(error);
    }
  };

  const handleSelectedVariation = async (selected) => {
    try {
      if (selected.length > 0) {
        const url = `${process.env.REACT_APP_API_URL}/catalog/${advertID}/publish/${selected}`;
        const header = { headers: { Authorization: `Bearer ${getToken()}` } };
        const response = await axios.post(url, {}, header);
        if (response) {
          Swal.fire({
            title: "Atenção",
            type: response.data.status,
            html: `<p>${response.data.message}</p>`,
            showCloseButton: true,
          });
        }
      } else if (
        selected.length === 0 &&
        externalData.variations.length === 0
      ) {
        const url = `${process.env.REACT_APP_API_URL}/catalog/${advertID}/publish/`;
        const header = { headers: { Authorization: `Bearer ${getToken()}` } };
        const response = await axios.post(url, {}, header);
        if (response) {
          Swal.fire({
            title: "Atenção",
            type: response.data.status,
            html: `<p>${response.data.message}</p>`,
            showCloseButton: true,
          });
        }
      } else {
        Swal.fire({
          title: "Atenção",
          html: "<p>Você deve selecionar ao menos uma variação elegível.</p>",
          type: "warning",
          showCloseButton: true,
        });
      }
    } catch (error) {
      alertError(error);
    }
  };

  if (externalData.catalog_listing) {
    return (
      <>
        <span
          style={{ color: "green" }}
          title="Este anúncio está no catálogo."
        >
          <i className="cil-spreadsheet mr-1" />
          Este anúncio está no catálogo
        </span>
      </>
    );
  }

  return (
    <>
      <span
        onClick={() => externalData.eligible && callForm()}
        className={externalData.eligible && "pointer"}
        style={{ color: externalData.eligible ? "#366b9d" : "gray" }}
        title={externalData.eligible ? "Clique para configurar catálogo" : "Não elegível para catálogo"}
      >
        <i className="cil-spreadsheet mr-1" />
        {externalData.eligible ? " Elegível para catálogo" : " Não elegível para catálogo"}
      </span>
    </>
  );
}
