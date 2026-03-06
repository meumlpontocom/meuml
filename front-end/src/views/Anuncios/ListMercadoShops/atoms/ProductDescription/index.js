import React                        from "react";
import { CCol, CRow }               from "@coreui/react";

import DescriptionPreview           from '../../../../../components/Adverts/Table/Body/AdvertDescription/Description';
import getListingTypes              from "../../../../../helpers/getListingTypes";

import { Title, Owner, Container }  from './styles';

const ProductDescription = ({
    productTitle, 
    productOwner, 
    productLink, 
    productId, 
    productCondition, 
    productShipping, 
    productListingType,
    productDateCreated,
    productDateModifield,
    productDescription
}) => {

    const adStyle = {
        color:
            productListingType === "free"
            ? "red"
            : productListingType === "gold_special"
            ? "#eb801d"
            : "green"
    };

    const createDateTimeString = (string) => String(new Date(string)
    .toLocaleDateString("pt-br", { hour: "2-digit", minute: "2-digit" }));

    return (

        <td
            id="description"
            name="description"
            style={{ verticalAlign: "middle" }}
            className="advert-description"
        >
            <CRow>
                <CCol sm="12" md="12" lg="12" xs="12">
                    <Title>
                        <span className="advertising-title">
                            {productTitle}
                        </span>
                    </Title>
                    <Owner>
                        <span className="advertising-owner">
                            ({productOwner})
                        </span>
                        <br />
                    </Owner>
                    
                    <Container>
                        <a
                            target="_blank"
                            href={productLink}
                            rel="noopener noreferrer"
                            style={{ color: "#919187" }}
                        >
                            {productId}
                        </a>
                        <span>
                        {productCondition === "used" ? (
                            <span
                                className="d-flex align-items-center"
                                style={{ color: "#8a4f3899" }}
                            >
                                <i className="cil-filter-photo mr-1" />
                                Produto Usado
                            </span>
                            ) : productCondition === "new" ? (
                            <span
                                className="d-flex align-items-center"
                                style={{ color: "#3b6af799" }}
                            >
                                <i className="cil-filter-photo mr-1" />
                                Produto Novo
                            </span>
                            ) : null}
                        </span>
                        <br />
                    </Container>

                    <span style={adStyle}>
                        <i className="cil-audio-description mr-1" />
                        Anúncio {getListingTypes(productListingType)}
                    </span>{" "}

                    <span style={{ marginLeft: "5px", color: productShipping === "1" ? "#17660b" : "#b02b13" }}>
                        <i className="cil-truck mr-1" />
                        {productShipping === "1" ? "Frete Grátis" : "Sem Frete Grátis"}
                    </span>
                    
                    <span style={{ color: "#6b6b6b", marginTop: "5px" }}>
                        <br />
                        <span className="mr-2">
                        <i className="cil-calendar mr-1" />
                        Criado em: {createDateTimeString(productDateCreated)}
                        </span>
                        <span>
                        <i className="cil-calendar-check mr-1" />
                        Última Modificação: {createDateTimeString(productDateModifield)}
                        </span>
                    </span>
                    <DescriptionPreview advertTitle={productTitle} text={productDescription} />
                </CCol>
            </CRow>
      </td>
    );
};

export default ProductDescription;