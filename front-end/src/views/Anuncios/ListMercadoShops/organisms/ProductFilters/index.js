import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CButton, CCol, CRow } from "@coreui/react";

import TagsSelectMenu from "src/components/Tags/TagsSelectMenu";
import { SimpleProductFilterDropdown, ProductFilterDropdown } from "../../atoms/ProductFilterDropdown/index";

import { getAProductsMshops } from "../../requests";

import { clearProductsState } from "../../../../../redux/actions/_mshopsActions";
import { filterAdverts, uncheckAllAdverts } from "../../../../../redux/actions";
import { resetSelectedTags } from "../../../../../redux/actions/_tagsActions";

export default function ProductFilters() {
  const [resetSelected, setResetSelected] = useState(false);

  const { first_page } = useSelector(state => state.mshops.meta);
  const { selectedTags } = useSelector(state => state.tags);
  const accountsObject = useSelector(state => state.accounts.accounts);
  const selectedFilters = useSelector(state => state.advertsFilters);
  const accounts = Object.values(accountsObject).filter(
    account => account.internal_status === 1 && account.platform === "ML",
  );
  const dispatch = useDispatch();

  const handleResetSelected = () => {
    setResetSelected(!resetSelected);
    dispatch(resetSelectedTags());
  };

  const dispatchFilters = filter => {
    dispatch(filterAdverts(filter));
  };

  const isEmpty = object => {
    for (let key in object) {
      if (object.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  };

  const createRequestString = () => {
    dispatch(uncheckAllAdverts());
    const entries = Object.entries(selectedFilters);
    let filterList = entries.map(objectEntry => {
      let filterString = [];

      const setFilter = filterName => {
        let filterValue = [];
        for (const key in objectEntry[1]) {
          filterValue.push(objectEntry[1][key].value);
        }
        filterString.push(`${filterName}=${filterValue}`);
      };

      if (!isEmpty(objectEntry[1])) {
        switch (objectEntry[0]) {
          case "accounts":
            setFilter("filter_account");
            break;

          case "status":
            setFilter("status");
            break;

          case "free_shipping":
            setFilter("free_shipping");
            break;

          case "sort_order":
            filterString.push(`sort_name=${objectEntry[1].value[0]}&sort_order=${objectEntry[1].value[1]}`);
            break;

          case "filter_string":
            filterString.push(`filter_string=${objectEntry[1].value}`);
            break;

          default:
            break;
        }
      }
      return filterString[0];
    });

    if (selectedTags.length) filterList.push(`shipping_tags=${selectedTags.map(({ id }) => id)}`);
    const filters = filterList.filter(x => x !== undefined).join("&");
    dispatch(clearProductsState());
    getAProductsMshops({ dispatch, filters, page: first_page });
  };

  return (
    <CRow>
      <CCol xl="12" sm="12" md="12" lg="12" xs="12">
        <CRow>
          <CCol sm="3" md="3" lg="3" xl="3" xs="4" className="mb-1">
            <ProductFilterDropdown
              resetSelected={resetSelected}
              renderSelectAll={true}
              handleChange={value => dispatchFilters({ accounts: { ...value } })}
              placeholder="Conta(s)"
              multipleSelection={true}
              includeFilter={true}
              options={accounts.map(account => ({
                label: account.name,
                value: account.id,
              }))}
            />
          </CCol>
          <CCol sm="3" md="3" lg="3" xl="3" xs="4" className="mb-1">
            <ProductFilterDropdown
              resetSelected={resetSelected}
              renderSelectAll={true}
              handleChange={value => dispatchFilters({ status: { ...value } })}
              placeholder="Status"
              multipleSelection={true}
              includeFilter={true}
              options={[
                { label: "Ativos", value: "active" },
                { label: "Finalizados", value: "closed" },
                { label: "Pausados", value: "paused" },
              ]}
            />
          </CCol>
          <CCol sm="3" md="3" lg="3" xl="3" xs="4" className="mb-1">
            <ProductFilterDropdown
              resetSelected={resetSelected}
              renderSelectAll={true}
              handleChange={value => dispatchFilters({ free_shipping: { ...value } })}
              placeholder="Frete"
              multipleSelection={true}
              includeFilter={true}
              options={[
                { label: "Grátis", value: 1 },
                { label: "Pago", value: 0 },
              ]}
            />
          </CCol>
          <CCol sm="3" md="3" lg="3" xl="3" xs="4">
            <SimpleProductFilterDropdown
              resetSelected={resetSelected}
              handleChange={value => dispatchFilters({ filter_tags_and_catalog: { ...value } })}
              placeholder="Desconto"
              multipleSelection={false}
              includeFilter={false}
              options={[
                {
                  label: "Elegíveis para Desconto",
                  value: "loyalty_discount_eligible",
                },
                {
                  label: "Anúncios com Desconto Aplicado",
                  value: "loyalty_discount_applied",
                },
              ]}
            />
          </CCol>
          <CCol sm="3" md="3" lg="3" xl="3" xs="4">
            <SimpleProductFilterDropdown
              resetSelected={resetSelected}
              handleChange={value => dispatchFilters({ sort_order: { ...value } })}
              placeholder="Ordenar por"
              multipleSelection={false}
              includeFilter={false}
              options={[
                { label: "Título de A - Z", value: ["title", "asc"] },
                { label: "Título de Z - A", value: ["title", "desc"] },
                { label: "Código menor", value: ["id", "asc"] },
                { label: "Código maior", value: ["id", "desc"] },
                { label: "Menor preço", value: ["price", "asc"] },
                { label: "Maior preço", value: ["price", "desc"] },
                { label: "Menos vendidos", value: ["sold_quantity", "asc"] },
                { label: "Mais vendidos", value: ["sold_quantity", "desc"] },
                { label: "Menor estoque", value: ["available_quantity", "asc"] },
                { label: "Maior estoque", value: ["available_quantity", "desc"] },
              ]}
            />
          </CCol>
          <TagsSelectMenu />
          <CCol sm="6" md="3" lg="3" xl="3" xs="12">
            <CRow style={{ marginTop: "2px", marginLeft: "4px" }}>
              <CButton className="btn btn-primary mr-1" onClick={() => createRequestString()}>
                <i className="cil-filter" /> <small>Filtrar</small>
              </CButton>
              <CButton className="btn btn-secondary mr-3" onClick={() => handleResetSelected()}>
                <i className="cil-clear-all" /> <small>Limpar</small>
              </CButton>
            </CRow>
          </CCol>
        </CRow>
      </CCol>
    </CRow>
  );
}
