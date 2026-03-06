import { CCol } from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import Label from "reactstrap/lib/Label";
import SwitchComponent from "src/components/SwitchComponent";
import { toggleCopyShippingTerms } from "../../../redux/actions/_replicationActions";

export default function CopyShippingTermsSwitch() {
  const dispatch = useDispatch();
  const { copyShippingTerm } = useSelector(state => state.advertsReplication);

  return (
    <CCol style={{ padding: 0 }} className="mt-3">
      <Label className="mt-1 mr-3" htmlFor="shipping-term">
        Prazo de envio
      </Label>
      <small>Copiar informações do anúncio original:</small>
      <SwitchComponent
        id="create-ad-without-warranty"
        name="create-ad-without-warranty"
        checked={copyShippingTerm}
        value={copyShippingTerm}
        onChange={() => dispatch(toggleCopyShippingTerms())}
      />
    </CCol>
  );
}
