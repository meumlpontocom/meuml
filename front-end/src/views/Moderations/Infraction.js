import { CCol, CRow } from "@coreui/react";
import { Link } from "react-router-dom";

export default function Infraction({ infraction }) {
  const parseDate = date => new Date(date).toLocaleDateString("pt-BR");
  const HTML = ({ element }) => {
    return <div dangerouslySetInnerHTML={{ __html: element }} />;
  };
  return (
    <tr>
      <CRow className="d-flex justify-content-around">
        <CCol>
          <td>
            <strong>Conta:&nbsp;</strong>
            {infraction.account_name}
          </td>
          <td>
            <strong>ID:&nbsp;</strong>
            <Link
              to={{
                pathname: "/anuncios",
                state: { searchAdvertID: infraction.element_id },
              }}
            >
              <span className="text-info">{infraction.element_id}</span>
            </Link>
          </td>
          <td>
            <strong>Tipo:&nbsp;</strong>
            <span className="moderation-element-type font-weight-bold background-white text-muted">
              {infraction.element_type}
            </span>
          </td>
          <td>
            <strong>Data:&nbsp;</strong>
            {parseDate(infraction.date_created)}
          </td>
        </CCol>
        <CCol xs={12}>
          <p style={{ padding: "0px 12px" }}>
            <strong>Razão:&nbsp;</strong>
            <HTML element={infraction.reason} />
          </p>
          <p style={{ padding: "0px 12px" }}>
            <strong>Solução:&nbsp;</strong>
            <HTML element={infraction.remedy} />
          </p>
        </CCol>
      </CRow>
    </tr>
  );
}
