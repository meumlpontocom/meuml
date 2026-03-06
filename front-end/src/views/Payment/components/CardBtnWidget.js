import { useState }                                 from "react";
import { CCard, CCardBody, CCol, CContainer, CRow } from "@coreui/react";

function CardBtnWidget({ id, name, icon, title, content, color, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <CCard
      id={id}
      name={name}
      onClick={(e) => onClick ? onClick(e) : null}
      style={{ minHeight: "156px" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`card-accent-${hover ? color : "secondary"} pointer`}
    >
      <CCardBody>
        <CContainer fluid>
          <CRow>
            <CCol
              xs={3}
              className={"bg-" + color}
              style={{
                color: "white",
                borderRadius: "5px",
                height: "90px",
                width: "90px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {icon}
            </CCol>
            <CCol>
              <h4 className={`text-${color} card-title`}>{title}</h4>
              {content}
            </CCol>
          </CRow>
        </CContainer>
      </CCardBody>
    </CCard>
  );
}

export default CardBtnWidget;
