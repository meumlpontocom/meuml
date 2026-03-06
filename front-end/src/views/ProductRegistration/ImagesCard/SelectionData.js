import React, { useMemo } from "react";
import { CCallout }       from "@coreui/react";
import { useSelector }    from "react-redux";

function SelectionData() {
  const selectedImages = useSelector(state => state.newProduct.images.selectedImages);

  const selectedAmount = useMemo(() => {
    return Object.values(selectedImages).filter(x => x === true)?.length;
  }, [selectedImages]);

  return (
    <CCallout color="info" className="bg-light" style={{ top: "0px", right: "0px", marginTop: "0px" }}>
      <small className="text-muted">Imagens selecionadas</small>
      <br/>
      <p>
        <strong className="h4">
          {
            selectedAmount > 0
              ? <span>{selectedAmount}&nbsp;{selectedAmount > 1 ? "selecionadas" : "selecionada"}</span>
              : <span><i className="icon-fix cil-ban"/>&nbsp;nenhuma</span>
          }
        </strong>
      </p>
    </CCallout>
  );
}

export default SelectionData;
