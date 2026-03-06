import CIcon from '@coreui/icons-react';
import { CButton } from '@coreui/react';
import React from 'react'

export default function CancelButton({ history }) {
  function handleCancelButton() {
    history.goBack();
  }
  return (
    <CButton color="danger" onClick={handleCancelButton}>
      <CIcon name="cil-x" alt="X" />
      {" "}Cancelar
    </CButton>
  )
}
