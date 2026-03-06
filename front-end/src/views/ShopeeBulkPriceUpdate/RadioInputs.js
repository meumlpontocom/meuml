import { CCol, CInputGroup, CInputRadio, CLabel } from '@coreui/react'
import React from 'react'

export default function RadioInputs() {
  return (
    <CCol xs={12} className="mt-5">
      <CInputGroup className="justify-content-center customPaddingRight">
        <CLabel className="ml-5" htmlFor="bid-up" id="bid-up" name="bid-up">
          <h5 className="ml-4">Subir preço</h5>
        </CLabel>
        <CInputRadio className="mr-4" id="bid-up" name="bid-up" defaultChecked />
      </CInputGroup>
      <CInputGroup className="justify-content-center customPaddingRight">
        <CLabel className="ml-5 text-muted" htmlFor="bid-down" id="bid-down" name="bid-down">
          <h5 className="ml-4" style={{ paddingLeft: "12px" }}>Baixar preço</h5>
        </CLabel>
        <CInputRadio className="mr-4" id="bid-down" name="bid-down" disabled />
      </CInputGroup>
    </CCol>
  )
}
