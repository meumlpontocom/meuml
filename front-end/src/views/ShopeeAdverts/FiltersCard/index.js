import { useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import fetchShopeeAdverts from "../requests";
import SelectMenu from "./SelectMenu";
import { CCard, CCardBody, CCol, CInput, CRow } from "@coreui/react";
import AccountsDropdown from "../../../components/AccountsDropdown";
import {
  setAdvertsFilterString,
  setSelectedAccountList,
  setShopeeSort,
  setStockFilter,
} from "../../../redux/actions/_shopeeActions";
import ButtonComponent from "src/components/ButtonComponent";

function FiltersCard() {
  const dispatch = useDispatch();
  const {
    pagination: { page },
    filters,
  } = useSelector(({ shopee }) => shopee.advertising);

  const selectedAccounts = useSelector(({ accounts }) => accounts.selectedAccounts);

  const onSelectStockFilterOption = useCallback(
    menuSelectedOption => dispatch(setStockFilter(menuSelectedOption)),
    [dispatch],
  );

  const fetch = () => fetchShopeeAdverts({ dispatch, filters, page, selectedAccounts });

  useEffect(() => {
    return () => {
      dispatch(setSelectedAccountList([]));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CCard className="card-accent-primary">
      <CCardBody>
        <CRow>
          <AccountsDropdown
            placeholder="Selecione a(s) conta(s)"
            multiple={true}
            platform="SP"
            xs="12"
            md="4"
            style={{ padding: "0px 15px", marginTop: "7px" }}
          />
          <SelectMenu
            placeholder="Estoque"
            selected={filters.stock}
            onSelect={onSelectStockFilterOption}
            options={[
              { label: "Qualquer estoque", value: false },
              { label: "Maior que zero", value: true },
            ]}
          />
          <SelectMenu
            multiple={false}
            options={[
              { label: "Mais vendidos", value: ["sales", "desc"] },
              { label: "Menos vendidos", value: ["sales", "asc"] },
              { label: "Maior preço", value: ["price", "desc"] },
              { label: "Menor preço", value: ["price", "asc"] },
              { label: "Nome A - Z", value: ["name", "asc"] },
            ]}
            onSelect={selected => dispatch(setShopeeSort(selected))}
            selected={filters.sort}
            xs="12"
            md="4"
            placeholder="Ordenar por"
          />
          <SelectMenu
            multiple={true}
            options={[
              { label: "Ativos", value: "NORMAL" },
              { label: "Inativos", value: "UNLIST" },
              { label: "Apagados", value: "DELETED" },
              { label: "Banidos", value: "BANNED" },
            ]}
            onSelect={selected => dispatch(setAdvertsFilterString({ value: selected, filter: "status" }))}
            selected={filters.status}
            disabled={false}
            xs="12"
            md="4"
            placeholder="Status do Anúncio . . ."
          />
          <SelectMenu
            multiple={true}
            options={[
              { label: "Novo", value: "NEW" },
              { label: "Usado", value: "USED" },
            ]}
            onSelect={selected => dispatch(setAdvertsFilterString({ value: selected, filter: "condition" }))}
            selected={filters.condition}
            disabled={false}
            xs="12"
            md="4"
            className="mt-3"
            placeholder="Condição do Produto . . ."
          />
          <CCol xs="12" md="6" lg="5" xl="4">
            <CInput
              type="text"
              id="filter-string-input"
              name="filter-string-input"
              className="mt-3"
              placeholder="Buscar anúncio . . ."
              onKeyPress={({ key }) => key.toString() === "Enter" && fetch()}
              onChange={({ target: { value } }) => {
                dispatch(setAdvertsFilterString({ value: value, filter: "string" }));
              }}
              style={{ height: "38px" }}
            />
          </CCol>
          <CCol xs="12" sm="3" lg="2">
            <ButtonComponent
              title="Filtrar"
              icon="cil-filter"
              onClick={() => fetch()}
              className="mt-3"
              variant=""
              height="38px"
            />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>
  );
}

FiltersCard.propTypes = {
  history: PropTypes.object,
};

export default FiltersCard;
