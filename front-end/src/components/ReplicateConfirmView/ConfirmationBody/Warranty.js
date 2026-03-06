import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Col from "reactstrap/lib/Col";
import Input from "reactstrap/lib/Input";
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import InputGroupText from "reactstrap/lib/InputGroupText";
import SwitchComponent from "src/components/SwitchComponent";
import styled from "styled-components";
import {
  saveWarrantyTime,
  saveWarrantyType,
  toggleAllowCopyingWarranty,
  toggleCreateWithoutWarranty,
} from "../../../redux/actions/_replicationActions";

const SelectWarrantyStyles = styled.div`
  .input-group input {
    min-width: 60px;
  }
  select.custom-select {
    /* max-width: fit-content; */
    min-width: 100px;
  }
  @media (max-width: 768px) {
    i {
      display: none;
    }
  }
`;

export default function Warranty() {
  const dispatch = useDispatch();
  const history = useHistory();
  const from = history.location?.state?.from;
  const copyFromOtherSeller = from === "/replicar-anuncios";
  const [warrantyNumber, setWarrantyNumber] = useState(0);
  const [warrantyNumberLength, setWarrantyNumberLength] = useState("dias");
  const { warrantyTime, warrantyType, allow_copying_warranty, create_without_warranty } = useSelector(
    state => state.advertsReplication,
  );

  useEffect(() => {
    if (warrantyNumber && warrantyNumberLength) {
      dispatch(saveWarrantyTime(`${warrantyNumber} ${warrantyNumberLength}`));
    }
  }, [warrantyNumber, warrantyNumberLength, dispatch]);

  const setWarrantyType = type => dispatch(saveWarrantyType(type));

  return (
    <>
      {!copyFromOtherSeller && (
        <Col xs={12} sm={12} md={12} lg={12} className="mb-4" style={{ padding: "0px 0px 0px 0px" }}>
          <p>Copiar informações de garantia do anúncio original?</p>
          <SwitchComponent
            id="copy-same-title-ads"
            name="copy-same-title-ads"
            checked={allow_copying_warranty}
            value={allow_copying_warranty}
            onChange={() => dispatch(toggleAllowCopyingWarranty())}
          />
        </Col>
      )}
      <Col xs={12} sm={12} md={12} lg={12} className="mb-4" style={{ padding: "0px 0px 0px 0px" }}>
        <p>
          {allow_copying_warranty
            ? "Caso anúncio original não tenha informação de garantia, preencher com:"
            : "Preencher garantia de todos produtos com:"}
        </p>
        <SwitchComponent
          id="create-ad-without-warranty"
          name="create-ad-without-warranty"
          checked={create_without_warranty}
          value={create_without_warranty}
          onChange={() => dispatch(toggleCreateWithoutWarranty())}
          leftText={{
            text: "Com garantia",
            color: "text-success",
          }}
          rightText={{
            text: "Sem garantia",
            color: "text-warning",
          }}
        />
      </Col>
      {!create_without_warranty ? (
        <>
          <SelectWarrantyStyles>
            <InputGroup className="mt-1">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="cil-info mr-1" />
                  Tempo de garantia
                </InputGroupText>
              </InputGroupAddon>

              <Input
                required
                id="warranty-time"
                name="warranty-time"
                className="form-control"
                type="text"
                value={warrantyTime}
                onChange={({ target: { value } }) => setWarrantyNumber(value)}
              />
              <select
                className="custom-select"
                onChange={({ target: { value } }) => setWarrantyNumberLength(value)}
              >
                <option value="dias">dias</option>
                <option value="meses">meses</option>
                <option value="anos">anos</option>
              </select>
            </InputGroup>
            <InputGroup className="mt-3">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <i className="cil-info mr-1" />
                  Tipo de garantia
                </InputGroupText>
              </InputGroupAddon>
              <select
                required
                id="warranty-type"
                name="warranty-type"
                value={warrantyType}
                onChange={({ target: { value } }) => setWarrantyType(value)}
                className="custom-select"
              >
                <option value="select">Selecionar ...</option>
                <option value="Garantia do vendedor">Garantia do vendedor</option>
                <option value="Garantia de fábrica">Garantia de fábrica</option>
              </select>
            </InputGroup>
          </SelectWarrantyStyles>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
