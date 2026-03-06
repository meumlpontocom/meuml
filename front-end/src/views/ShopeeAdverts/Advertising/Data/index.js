import React         from "react";
import PropTypes     from "prop-types";
import DataText      from "./DataText";
import {useSelector} from "react-redux";
import Swal          from "sweetalert2";
import {CCol, CRow}  from "@coreui/react";

function Data({id}) {
  const {
    condition,
    description,
    has_variation,
    item_sku,
    likes,
    name,
    package_height,
    package_length,
    package_width,
    reserved_stock,
    status,
    stock,
    update_time,
    views,
    weight,
    images,
    account_id
  } = useSelector(
    ({shopee}) =>
      shopee.advertising.list.filter((advert) => advert.id === id)[0]
  );

  function showFullAdvertDescription() {
    Swal.fire({
      title: name,
      imageUrl: images[0],
      imageHeight: 200,
      imageWidth: 200,
      text: description,
      showCloseButton: true,
      showConfirmButton: false,
      showCancelButton: false,
    });
  }

  function TranslatedStatus() {
    let translation = "";
    switch (status) {
      case "NORMAL":
        translation = "Normal";
        break;
      case "DELETED":
        translation = "Deletado";
        break;
      case "BANNED":
        translation = "Banido";
        break;
      case "UNLIST":
        translation = "Não listado";
        break;
      default:
        break;
    }
    return (
      <span>
        {translation}
      </span>
    );
  }

  return (
    <td>
      <CRow>
        <CCol xs="12" sm="12" md="8" lg="10" xl="10">
          <h4 className="text-dark">{name}</h4>
          <CRow>
            <CCol xs="12" sm="12" md="4" lg="4" xl="4">
              <DataText
                color="info"
                label="Conta (id)"
                text={account_id}
                icon="user"
              />
              <DataText
                color={condition === "NEW" ? "dark" : "warning"}
                label="Condição"
                text={condition === "NEW" ? "novo" : "usado"}
                icon="star"
              />
              <DataText
                color={stock <= 0 ? "warning" : status === "NORMAL" ? "muted" : "warning"}
                label="Status"
                text={stock <= 0 ? "Desativado" : <TranslatedStatus status={status}/>}
                icon={stock <= 0 ? "bell-exclamation" : status === "NORMAL" ? "bell" : "bell-exclamation"}
              />
              <DataText
                color={stock >= 5 ? "success" : "danger"}
                label="Estoque"
                text={stock + " un."}
                icon="layers"
              />
              <DataText
                color={reserved_stock > 0 ? "success" : "secondary"}
                label="Estoque reservado"
                text={reserved_stock + " un."}
                icon="library-add"
              />
            </CCol>
            <CCol xs="12" sm="12" md="4" lg="4" xl="4">
              <DataText
                color={likes > 0 ? "primary" : "secondary"}
                label="Likes"
                text={likes}
                icon="thumb-up"
              />
              <DataText
                color={views > 0 ? "primary" : "secondary"}
                label="Visualizações"
                text={views}
                icon="center-focus"
              />
              <DataText
                color="info"
                label="SKU"
                text={item_sku ? item_sku : "N/A"}
                icon="barcode"
              />
              <DataText
                color="muted"
                label="Variações"
                text={has_variation ? "Sim" : "Não"}
                icon="fork"
              />
            </CCol>
            <CCol xs="12" sm="12" md="4" lg="4" xl="4">
              <DataText color="muted" label="Peso" text={weight} icon="3d"/>
              <DataText
                color="muted"
                label="Comprimento"
                text={package_length}
                icon="border-vertical"
              />
              <DataText
                color="muted"
                label="Altura"
                text={package_height}
                icon="border-right"
              />
              <DataText
                color="muted"
                label="Largura"
                text={package_width}
                icon="border-bottom"
              />
            </CCol>
            <CCol
              xs="12"
              sm="12"
              md="4"
              title="Clique para ver mais!"
              style={{cursor: "pointer"}}
              onClick={showFullAdvertDescription}
            >
              <DataText
                color="muted"
                label="Descrição"
                text={`${description.slice(0, 10)}...`}
                icon="notes"
              />
            </CCol>
            <CCol
              xs="12"
              sm="12"
              md="8"
            >
              <DataText
                color={
                  new Date(update_time) === new Date() ? "warning" : "muted"
                }
                label="Última atualização"
                text={`${new Date(update_time).toLocaleDateString("pt-BR")}`}
                icon="clock"
              />
            </CCol>
          </CRow>
        </CCol>
      </CRow>
    </td>
  );
}

Data.propTypes = {
  id: PropTypes.string,
};

export default Data;
