import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import Input from "reactstrap/lib/Input";
import InputGroup from "reactstrap/lib/InputGroup";
import InputGroupAddon from "reactstrap/lib/InputGroupAddon";
import InputGroupText from "reactstrap/lib/InputGroupText";
import { saveShippingTerm } from "../../../redux/actions/_replicationActions";

export default function ShippingTerm() {
  const dispatch = useDispatch();
  const history = useHistory();
  const from = history.location?.state?.from;
  const copyFromOtherSeller = from === "/replicar-anuncios";
  const shipping_term = useSelector(state => state.advertsReplication?.shipping_term);
  const copyShippingTerm = useSelector(state => state.advertsReplication?.copyShippingTerm);

  const setShippingTerm = value => dispatch(saveShippingTerm(value));
  return !copyShippingTerm || copyFromOtherSeller ? (
    <>
      <span>Preencher prazo de envio de todos produtos com:</span>
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            <i className="cil-truck mr-1" />
          </InputGroupText>
        </InputGroupAddon>
        <Input
          type="number"
          id="shipping-term"
          name="shipping-term"
          className={`form-control col-xs-8 col-sm-4 col-md-3 col-lg-3 ${
            shipping_term < 0 || shipping_term > 45 ? " is-invalid" : ""
          }`}
          min="0"
          max="45"
          value={shipping_term}
          onChange={({ target: { value } }) => setShippingTerm(value)}
          required
        />
        <InputGroupAddon addonType="append">
          <InputGroupText>dias corridos</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      {shipping_term < 0 || shipping_term > 45 ? (
        <small className="text-danger">Utilize no mínimo 0 e no máximo 45</small>
      ) : (
        <small>Para criar anúncios sem prazo de envio, informe 0.</small>
      )}
    </>
  ) : (
    <></>
  );
}
