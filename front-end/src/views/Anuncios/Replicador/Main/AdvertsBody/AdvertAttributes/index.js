import React from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Container from "reactstrap/lib/Container";
import "./style.css";

export default function AdvertAttributes({ id }) {
  const ReactSwal = withReactContent(Swal);

  const { attributes } = useSelector(state => {
    const { adverts } = state.advertsReplication;
    const advertToUpdate = adverts.filter(advert => advert.id === id);
    return advertToUpdate[0];
  });

  function showAttributes() {
    ReactSwal.fire({
      title: "Atributos do anúncio",
      html: (
        <Container id="table-container">
          <table id="table">
            <thead>
              <tr>
                <th>Atributo</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attribute, index) => (
                <tr key={index}>
                  <td>{attribute.name}</td>
                  <td>{attribute.value_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Container>
      ),
      type: "info",
      showCloseButton: true,
    });
  }

  const displayedAttributes = attributes.slice(0, 3);

  return attributes?.length ? (
    <span className="text-muted">
      <i className="cil-list-rich" />
      Atributos:{" "}
      <span>
        {displayedAttributes.map((attribute, index) => (
          <span key={index}>
            <span className="text-primary">
              {attribute.name}
              {index < displayedAttributes.length - 1 && ", "}
            </span>
          </span>
        ))}
        {attributes.length > 3 && (
          <span style={{ cursor: "pointer" }} className="text-info ml-1" onClick={showAttributes}>
            [Ver mais]
          </span>
        )}
      </span>
    </span>
  ) : (
    <></>
  );
}
