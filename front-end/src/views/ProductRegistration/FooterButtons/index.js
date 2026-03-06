import React, { useContext, useMemo }          from "react";
import api                                     from "../../../services/api";
import Swal                                    from "sweetalert2";
import { getToken }                            from "../../../services/auth";
import { useHistory }                          from "react-router-dom";
import { setResetImageSelection }              from "../../../redux/actions/_newProductActions";
import { useSelector, useDispatch }            from "react-redux";
import { ProductRegistrationContext }          from "../ProductRegistrationContext";
import { CCard, CCardBody, CButton, CSpinner } from "@coreui/react";

const FooterButtons = ({ isEditing, isVariation, parentID }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const {
    isPending,
    productInfo,
    setIsPending,
    setProductInfo,
    hasExpirationDate,
    setProductAttribute,
    productAttributesList,
    setProductAttributesList,
  } = useContext(ProductRegistrationContext);
  const productMainImageID = useSelector(state => state.newProduct.images.mainImageID);
  const productImageList = useSelector(state => state.newProduct.images.selectedImages);

  async function registerProduct(product) {
    const httpMethod = isEditing ? "put" : "post"
    return await api[httpMethod](`/articles${isEditing ? `/${productInfo.id}` : ""}`, product, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
  }

  async function handleProductRegistration() {
    try {
      if (Object.values(productInfo)?.some((value) => typeof value === "string" && value?.trim() === "")) return;
      setIsPending(true);
      const attributesList = productAttributesList?.map(({ field, value }) => ({ field, value }));
      const images = Object.keys(productImageList)
        .filter(imageID => productImageList[imageID] === true)
        .map(imageID => ({ id: imageID, is_main_image: Number(imageID) === Number(productMainImageID) }));
      const new_article = [
        {
          ...productInfo,
          has_expiration_date: hasExpirationDate,
          attributes: attributesList || [],
          images,
        },
      ];
      const payload = isEditing ? new_article[0] : {
        ...(isVariation && {
          article_variation_parent: {
            parent_id: parentID,
          },
        }),
        new_article,
      };
      const registerProductAPIResponse = await registerProduct(payload);
      if (registerProductAPIResponse.data.status === "success") {
        await Swal.fire("Sucesso", "Produto cadastrado com sucesso!", "success");
        if (isEditing) history.push({ pathname: "/produtos/cadastrados", state: { wasEditing: true } });
      }
      if (!isVariation) {
        setProductInfo({ name: "", sku: "", description: "" });
        setProductAttributesList([]);
      }
      setIsPending(false);
    } catch (error) {
      Swal.fire({
        title: "Erro",
        html: `<p>${error.response?.data?.message || error?.message || error}</p>`,
        type: "error",
        showCloseButton: true,
      });
      setIsPending(false);
      return error;
    }
  }

  const disableConfirmBtn = useMemo(() => {
    return isPending || Object?.values(productInfo)?.some(
      value => typeof value === "string" && value?.trim() === ""
    )
  }, [isPending, productInfo]);

  function handleCleanFormClick() {
    setProductInfo({ name: "", sku: "", description: "" });
    setProductAttribute({ field: "", value: "" });
    setProductAttributesList([]);
    dispatch(setResetImageSelection());
  }

  const ConfirmBtnIcon = () => isPending ? <CSpinner size="sm" className="mr-2"/> : <i className="cil-check mr-2"/>;

  return (
    <CCard>
      <CCardBody className="d-flex align-items-center justify-content-end">
        <CButton
          color="dark"
          className="d-flex align-items-center justify-content-center text-uppercase"
          onClick={() => history.goBack()}
        >
          <i className="cil-arrow-left mr-2"/>
          voltar
        </CButton>
        <CButton
          color="danger"
          className="d-flex align-items-center justify-content-center text-uppercase ml-3"
          onClick={handleCleanFormClick}
        >
          <i className="cil-x mr-2"/>
          limpar
        </CButton>
        <CButton
          color="primary"
          disabled={disableConfirmBtn}
          onClick={handleProductRegistration}
          className="d-flex align-items-center justify-content-center text-uppercase ml-3 "
        >
          <ConfirmBtnIcon/>
          {isEditing ? "salvar" : "cadastrar"}
        </CButton>
      </CCardBody>
    </CCard>
  );
};

export default FooterButtons;
