import React            from "react";
import PropTypes        from "prop-types";
import { CTooltip }     from "@coreui/react";
import Swal             from "sweetalert2";
import withReactContent from "sweetalert2-react-content";


function DescriptionPreview({ advertTitle, text }) {
  const ReactSwal = withReactContent(Swal);

  function handleClickDescription() {
    ReactSwal.fire({
      type: "info",
      title: advertTitle,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: "Fechar",
      html: (
        <div style={{ padding: "15px", overflowY: "scroll", maxHeight: "500px" }}>
          {text.split("\n").map(x => <p className="text-left mb-3">{x}</p>)}
        </div>
      ),
    });
  }

  return text ?
    (
      <CTooltip content="Clique para ver mais" placement="bottom-start">
        <p className="pointer" onClick={handleClickDescription}>
          <i className="cil cil-short-text mr-1"/>
          Descrição:&nbsp;{text.substring(0, 20)}...
        </p>
      </CTooltip>
    ) : <></>;
}

DescriptionPreview.propTypes = {
  text: PropTypes.string
};

export default DescriptionPreview;
