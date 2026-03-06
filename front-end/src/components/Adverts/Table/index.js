import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Col, Row, Table } from "reactstrap";
import { checkAllAdverts, checkAllAdvertsFromPage, uncheckAllAdverts } from "../../../redux/actions";
import TableBody from "./Body";
import TableHeader from "./Header";
import "./styles.scss";

function AdsTable({ adsCount }) {
  const advertising = useSelector(state => state.adverts);
  const { total } = useSelector(state => state.advertsMeta);
  const selectedAdverts = useSelector(state => state.selectedAdverts);

  const obj = useMemo(() => {
    return { ...advertising };
  }, [advertising]);

  const objLength = Object.keys(obj);

  useEffect(() => {
    const informObjectLength = () => {
      if (objLength.length === 1 && objLength[0] === "0") return 0;
      else return objLength.length;
    };

    const adsCounter = adsCount(informObjectLength());
    return () => `adsCounter: ${adsCounter}`;
  }, [adsCount, objLength]);

  const dispatch = useDispatch();

  const anyAdSelected = () => {
    if (selectedAdverts.allChecked === true || selectedAdverts.pagesAllChecked.length > 0) return true;
    else {
      const advertsArray = selectedAdverts.advertsArray;
      let atLeastOneChecked = false;
      for (const key in advertsArray) {
        if (advertsArray[key].checked === true) atLeastOneChecked = true;
      }
      return atLeastOneChecked;
    }
  };

  const howManySelected = () => {
    const sumTotal = Object.values(selectedAdverts.advertsArray).filter(item => !item.checked);
    if (selectedAdverts.allChecked === true) return `${total - sumTotal.length} anúncios selecionados`;
    else {
      const advertsArray = selectedAdverts.advertsArray;
      let selectedLength = 0;
      for (const key in advertsArray) {
        if (advertsArray[key].checked === true) selectedLength = selectedLength += 1;
      }
      if (selectedLength > 0) return `${selectedLength} anúncios selecionados`;
      else return "Nenhum anúncio selecionado.";
    }
  };

  const dispatchAllChecked = () => {
    dispatch(
      checkAllAdverts({
        adverts: { ...advertising },
        page: true,
      }),
    );
  };

  const dispatchAllUnchecked = () => {
    dispatch(uncheckAllAdverts());
  };

  const dispatchAllCheckedFromPage = () => {
    dispatch(
      checkAllAdvertsFromPage({
        adverts: { ...advertising },
        page: true,
      }),
    );
  };

  if (advertising[0].id === "noADVERTS") {
    return <p className="text-center">Você não possui anúncios</p>;
  }

  return (
    <Row>
      <Col sm="12" md="12" lg="12" xs="12">
        <span className="badge badge-secondary mb-2">{howManySelected()}</span>
      </Col>
      <Col sm="12" md="12" lg="12" xs="12">
        <Button
          style={{ marginBottom: "10px", marginRight: "10px" }}
          color="primary"
          size="sm"
          onClick={() => dispatchAllCheckedFromPage()}
        >
          Selecionar todos da página
        </Button>
        <Button
          style={{ marginBottom: "10px", marginRight: "10px" }}
          color="primary"
          size="sm"
          onClick={() => dispatchAllChecked()}
        >
          Selecionar todos
        </Button>
        <Button
          style={{ marginBottom: "10px", marginRight: "10px" }}
          color="secondary"
          size="sm"
          disabled={!anyAdSelected()}
          onClick={() => dispatchAllUnchecked()}
        >
          Limpar seleção
        </Button>
      </Col>
      <Col sm="12" md="12" lg="12" xs="12">
        <Table className="table table-sm" style={{ minHeight: "121px" }}>
          <TableHeader />
          <TableBody adverts={Object.values(advertising)} />
        </Table>
      </Col>
    </Row>
  );
}

export default AdsTable;
