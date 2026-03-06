import React, { useMemo }           from "react"
import PropTypes                    from "prop-types"
import { CInput }                   from "@coreui/react"
import { useDispatch, useSelector } from "react-redux";
import { setSelectedAdvertising }   from "src/redux/actions/_shopeeActions";

function SelectAdvertising({ advertId, accountId }) {
  const dispatch = useDispatch();
  const selectedState = useSelector(({ shopee }) => shopee.advertising.selected);

  const isChecked = useMemo(() => {
    return selectedState[advertId].checked;
  }, [advertId, selectedState]);

  function handleAdSelect({ target: { id, checked } }) {
    dispatch(setSelectedAdvertising({ checked, id, account_id: accountId }));
  }
  return (
    <td>
      <CInput
        id={advertId}
        type="checkbox"
        title="Selecionar anúncio"
        checked={isChecked}
        onChange={handleAdSelect}
      />
    </td>
  )
}

SelectAdvertising.propTypes = {
  advertId: PropTypes.number.isRequired,
  accountId: PropTypes.number.isRequired
}

export default SelectAdvertising;
