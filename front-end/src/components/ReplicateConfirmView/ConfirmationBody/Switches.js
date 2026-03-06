import { CCol, CLabel } from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import SwitchComponent from "src/components/SwitchComponent";
import { toggleCopySameAccountAds, toggleCopySameTitleAds } from "../../../redux/actions/_replicationActions";

export default function Switches() {
  const dispatch = useDispatch();
  const allow_duplicated_account = useSelector(state => state.advertsReplication.allow_duplicated_account);
  const allow_duplicated_title = useSelector(state => state.advertsReplication.allow_duplicated_title);

  return (
    <>
      <CCol>
        <CLabel htmlFor="copy-same-title-ads">
          Se já existir um anúncio com o <strong>mesmo título</strong> na conta de destino, você deseja:
        </CLabel>
        <SwitchComponent
          id="copy-same-title-ads"
          name="copy-same-title-ads"
          checked={allow_duplicated_title}
          value={allow_duplicated_title}
          onChange={() => dispatch(toggleCopySameTitleAds())}
        />
      </CCol>
      <CCol className="mt-4">
        <CLabel htmlFor="copy-same-account-ads">
          Deseja copiar anúncios de uma conta para a mesma conta? (duplicação)
        </CLabel>
        <SwitchComponent
          id="copy-same-account-ads"
          name="copy-same-account-ads"
          checked={allow_duplicated_account}
          value={allow_duplicated_account}
          onChange={() => dispatch(toggleCopySameAccountAds())}
        />
      </CCol>
    </>
  );
}
