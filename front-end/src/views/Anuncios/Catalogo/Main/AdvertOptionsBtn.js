/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo } from "react";
import store from "../../../../redux/store";
import { Provider, useDispatch } from "react-redux";
import CatalogCandidates from "../../../../components/Adverts/Table/Body/AdvertOptions/CatalogCandidates";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "../../../../services/api";
import Col from "reactstrap/lib/Col";
import Input from "reactstrap/lib/Input";
import Button from "reactstrap/lib/Button";
import Container from "reactstrap/lib/Container";
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupText from "reactstrap/lib/InputGroupText";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import { CATALOG_OPT_IN } from "../../../../redux/actions/action-types";
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from "@coreui/react";

export default function AdvertOptionsBtn({
  itemRelations,
  advertId,
  advertExternalId,
  catalogListing,
  ad,
  permissions,
  history,
}) {
  const permission = useMemo(() => {
    return permissions?.modules_id && permissions?.modules_id.find(i => i === 6);
  }, [permissions?.modules_id]);
  const dispatch = useDispatch();

  const url = useMemo(() => {
    return itemRelations?.length > 0
      ? `advertisings/catalog_candidates?advertising_id=${itemRelations[0]?.id}&variation_id=${itemRelations[0]?.variation_id}`
      : `advertisings/catalog_candidates?advertising_id=${advertExternalId}`;
  }, [itemRelations.length, advertExternalId]);

  const ReactSwal = withReactContent(Swal);

  const catalogCandidates = candidates => {
    let searchString = "";
    const handleChange = userInput => (searchString = userInput);

    const handleRequest = () => {
      dispatch({ type: "FETCH_CHANGE_CATALOG" });
    };

    const searchAlternativeTitle = async () => {
      try {
        ReactSwal.showLoading();
        if (!searchString) {
          Swal.fire({
            title: "Atenção",
            type: "warning",
            showCloseButton: true,
            html: "<p>Você precisa informar um título válido para pesquisar no catálogo.",
          });
        } else {
          const response = await api.get(url + `&alternative_product_title=${searchString}`);
          await ReactSwal.fire({
            title: searchString,
            showCancelButton: true,
            showConfirmButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Salvar",
            type: response.data.status,
            html: (
              <Provider store={store}>
                <Container
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "0 0",
                  }}
                >
                  <CatalogCandidates
                    advertId={advertId}
                    catalogCandidates={response.data.data.catalog_candidates}
                  />
                </Container>
              </Provider>
            ),
          }).then(user => {
            return user.value ? handleRequest() : null;
          });
        }
      } catch (error) {
        return error;
      }
    };
    if (candidates) {
      return (
        <Provider store={store}>
          <CatalogCandidates advertId={advertId} catalogCandidates={candidates} />
        </Provider>
      );
    }
    return (
      <div id="catalogCategoryPopup">
        <div id="searchCatalog" name="searchCatalog">
          <Col
            sm="12"
            md="12"
            lg="12"
            xs="12"
            style={{
              alignSelf: "center",
              marginTop: 20,
              marginBottom: 20,
            }}
          >
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="cil-find mr-1" />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                placeholder="Procure um catálogo para seu anúncio . . ."
                onChange={event => handleChange(event.target.value)}
              />
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={() => searchAlternativeTitle()}>
                  Pesquisar
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </Col>
        </div>
      </div>
    );
  };
  const handleSelectedOption = async selectedOption => {
    try {
      switch (selectedOption) {
        case "SearchForAlternativeTitle":
          ReactSwal.fire({
            title: "Pesquisar Título Alternativo",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            showConfirmButton: false,
            type: "question",
            html: catalogCandidates(null),
          });
          break;
        case "SearchForSimilarItems":
          const response = await api.get(url);
          if (response.data.data.catalog_candidates.length === 0) {
            ReactSwal.fire({
              titleText: "Atenção",
              type: response.data.status,
              html: `<p>${response.data.message}</p>`,
              timer: 3000,
              onBeforeOpen: () => ReactSwal.showLoading(),
              // Recursive calls this:handleSelectedOption function to fall in first switch.case
              onClose: () => handleSelectedOption("SearchForAlternativeTitle"),
            });
            break;
          } else if (response.data.data.catalog_candidates.length > 0) {
            ReactSwal.fire({
              titleText: "Atenção",
              showCancelButton: true,
              showConfirmButton: true,
              cancelButtonText: "Cancelar",
              confirmButtonText: "Salvar",
              type: response.data.status,
              html: catalogCandidates(response.data.data.catalog_candidates),
            }).then(user =>
              user.value ? dispatch({ type: CATALOG_OPT_IN, payload: advertExternalId }) : null,
            );
            break;
          } else {
            ReactSwal.fire({
              title: "Atenção",
              type: response.status,
              html: `<p>${response.message}</p>`,
              showCloseButton: true,
            });
            break;
          }
        default:
          break;
      }
    } catch (error) {
      Swal.fire({
        title: "Atenção",
        type: "error",
        text: error.response ? error.response.data.message : error.message ? error.message : error,
        showCloseButton: true,
      });
      return error;
    }
  };
  return (
    <td className="text-center">
      <CDropdown className="mt-2">
        <CDropdownToggle caret color="primary">
          <span>
            <i className="cil cil-cog mr-1 mt-1" />
            Opções
          </span>
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem
            style={{ cursor: "pointer" }}
            className={catalogListing && permission ? "dropdown-item" : "dropdown-item disabled"}
            name="SearchForSimilarItems"
            id="SearchForSimilarItems"
            onClick={() => handleSelectedOption("SearchForSimilarItems")}
          >
            Buscar itens similares no catálogo
          </CDropdownItem>
          <CDropdownItem
            style={{ cursor: "pointer" }}
            className={catalogListing && permission ? "dropdown-item" : "dropdown-item disabled"}
            name="SearchForAlternativeTitle"
            id="SearchForAlternativeTitle"
            onClick={() => handleSelectedOption("SearchForAlternativeTitle")}
          >
            Pesquisar título alternativo
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>
    </td>
  );
}
