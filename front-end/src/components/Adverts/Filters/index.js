import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Row } from "reactstrap";
import ButtonComponent from "src/components/ButtonComponent";
import { advertsURL, clearAdvertsState, filterAdverts, uncheckAllAdverts } from "../../../redux/actions";
import { resetSelectedTags } from "../../../redux/actions/_tagsActions";
import TagsSelectMenu from "../../Tags/TagsSelectMenu";
import Dropdown, { SimpleDropdown } from "./Dropdown";
import "./filter.css";

export default function AdvertsFilters({ savedURL }) {
  const [resetSelected, setResetSelected] = useState(false);
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

          case "filter_tags_and_catalog":
            switch (objectEntry[1].value) {
              case 0:
                filterString.push(`filter_catalog=${objectEntry[1].value}`);
                break;
              case 1:
                filterString.push(`filter_catalog=${objectEntry[1].value}`);
                break;
              case 2:
                filterString.push(`filter_catalog=${objectEntry[1].value}`);
                break;
              default:
                filterString.push(`filter_tags=${objectEntry[1].value}`);
                break;
            }
            break;

          default:
            dispatch(advertsURL(""));
            break;
        }
      }
      return filterString[0];
    });

    if (selectedTags.length) filterList.push(`meuml_tags=${selectedTags.map(({ id }) => id)}`);

    const joinedFilterList = filterList.filter(x => x !== undefined).join("&");

    if (joinedFilterList !== savedURL) {
      dispatch(clearAdvertsState());
      dispatch(advertsURL(joinedFilterList));
    }
  };

  return (
    <Row>
      <Col sm="6" md="4" lg="4" xl="4" xs="12" className="mb-1">
        <Dropdown
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
      </Col>
      <Col sm="6" md="4" lg="4" xl="4" xs="12" className="mb-1">
        <Dropdown
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
      </Col>
      <Col sm="6" md="4" lg="4" xl="4" xs="12" className="mb-1">
        <Dropdown
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
      </Col>
      <Col sm="6" md="4" lg="4" xl="4" xs="12" className="mb-1">
        <SimpleDropdown
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
      </Col>
      <Col sm="6" md="4" lg="4" xl="4" xs="12" className="mb-1">
        <SimpleDropdown
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
            { label: "Mais antigos", value: ["date_created", "asc"] },
            { label: "Mais novos", value: ["date_created", "desc"] },
            {
              label: "Menor estoque",
              value: ["available_quantity", "asc"],
            },
            {
              label: "Maior estoque",
              value: ["available_quantity", "desc"],
            },
          ]}
        />
      </Col>
      <TagsSelectMenu sm="6" md="4" lg="4" xl="4" xs="12" />
      <Col sm="12" md="12" lg="12" xl="12" xs="12">
        <Row>
          <Col sm="6" md="4" lg="4" xl="2" xs="12" className="mt-2">
            <ButtonComponent
              onClick={createRequestString}
              icon="cil-filter"
              variant=""
              title="Filtrar"
              width="100%"
            />
          </Col>
          <Col sm="6" md="2" lg="2" xl="2" xs="12" className="mt-2">
            <ButtonComponent
              onClick={handleResetSelected}
              icon="cil-clear-all"
              color="dark"
              title="Limpar"
              width="100%"
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
