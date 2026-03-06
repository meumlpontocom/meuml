import React, { useCallback, useContext, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import { useSelector } from "react-redux";
import { fetchAdvertisingCreation } from "../requests";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import { CButton } from "@coreui/react";
import { FaCheckCircle } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import { createMlAdvertContext } from "../createMlAdvertContext";
import withReactContent from "sweetalert2-react-content";
import { linkChartRowWithAdverts } from "../../CatalogCharts/requests";

const ConfirmAdvertCreationBtn = ({ className }) => {
  const history = useHistory();
  const [errorList, setErrorList] = useState([]);
  const {
    form,
    catalogOptions,
    showAdvertAbstraction,
    setShowAdvertAbstraction,
    shouldEvaluateModerationEligibility,
  } = useContext(createMlAdvertContext);
  const selectedAccounts = useSelector(({ accounts }) => accounts.selectedAccounts);

  const mustCreateCatalogAdvert = useCallback(
    () =>
      !!(
        catalogOptions.length &&
        !form.variations.length &&
        form.listingType === "gold_pro" &&
        form.condition === "new"
      ),
    [catalogOptions.length, form.condition, form.listingType, form.variations.length],
  );

  const hasSelectedACatalogOption = useCallback(() => !!form.catalogId, [form.catalogId]);

  const attributes = useMemo(() => {
    const selectedCategory = form.selectedCategory;
    return form.attributes.map(formAttribute => {
      const selectedCategoryAttributeObject = selectedCategory.attributes.find(
        originalAttribute => originalAttribute.id === formAttribute.id,
      );
      const attributeValueId = formAttribute?.values?.find(
        value => value.name.toLowerCase() === formAttribute.value_name.toLowerCase(),
      )?.id;

      if (selectedCategoryAttributeObject?.value_id) {
        return {
          ...formAttribute,
          value_id: selectedCategoryAttributeObject.value_id,
        };
      } else if (attributeValueId) {
        return {
          ...formAttribute,
          value_id: attributeValueId,
        };
      } else return formAttribute;
    });
  }, [form]);

  const convertShippingMode = mode =>
    mode === "Mercado Envios" ? "me1" : mode === "Mercado Envios 2" ? "me2" : mode;

  const apiPayload = useMemo(
    () => ({
      title: form.title,
      price: form.price,
      pictures: form.images,
      condition: form.condition,
      attributes: attributes,
      variations: form.variations,
      description: form.description,
      shippingMode: convertShippingMode(form.shippingMode),
      accountId: selectedAccounts.map(({ value }) => value),
      categoryId: form.selectedCategory.category_id,
      listingTypeId: form.listingType,
      availableQuantity: form.availableQuantity,
      createClassicAdvert: form.createClassicAdvert,
      createCatalogAdvert: mustCreateCatalogAdvert() && !shouldEvaluateModerationEligibility,
      catalogId: form.catalogId,
      checkedMShopsAccounts: form.checkedMShopsAccounts,
      evaluateEligibility: shouldEvaluateModerationEligibility,
    }),
    [
      attributes,
      form.availableQuantity,
      form.catalogId,
      form.checkedMShopsAccounts,
      form.condition,
      form.createClassicAdvert,
      form.description,
      form.images,
      form.listingType,
      form.price,
      form.selectedCategory.category_id,
      form.shippingMode,
      form.title,
      form.variations,
      mustCreateCatalogAdvert,
      selectedAccounts,
      shouldEvaluateModerationEligibility,
    ],
  );

  const testValue = (value, errorDescription) => {
    if (!!value) return null;
    return errorDescription;
  };

  // Sweet alert errors and return false or return true;
  const validateForm = useCallback(_form => {
    const {
      title,
      price,
      pictures,
      condition,
      attributes,
      description,
      accountId,
      categoryId,
      listingTypeId,
      availableQuantity,
      shippingMode,
    } = _form;
    // If pass the test return null else return an error message
    return (
      [
        {
          id: uuidv4(),
          message: testValue(title, "Seu anúncio precisa de um título!"),
        },
        {
          id: uuidv4(),
          message: testValue(price, "Parece que você não informou um preço para seu produto."),
        },
        {
          id: uuidv4(),
          message: testValue(
            pictures.length,
            "Seu anúncio precisa de pelo menos uma imagem, com no mínimo 500 X 500 de resolução.",
          ),
        },
        {
          id: uuidv4(),
          message: testValue(condition, "Você deve informar qual a condição do seu produto."),
        },
        {
          id: uuidv4(),
          message: testValue(
            attributes.length,
            "Parece que existem atributos obrigatórios que não foram preenchidos.",
          ),
        },
        {
          id: uuidv4(),
          message: testValue(description, "Você precisa informar uma descrição para o seu produto."),
        },
        {
          id: uuidv4(),
          message: testValue(
            accountId,
            "Por favor, informe em qual/quais conta(s) deseja criar este anúncio.",
          ),
        },
        {
          id: uuidv4(),
          message: testValue(
            categoryId,
            "Por favor, informe uma categoria da árvore de categorias para esta publicação.",
          ),
        },
        {
          id: uuidv4(),
          message: testValue(
            listingTypeId,
            "Você deve selecionar o tipo da publicação Mercado Livre que deseja fazer: Premium ou Clássica.",
          ),
        },
        {
          id: uuidv4(),
          message: testValue(
            availableQuantity,
            "Você precisa informar o número de produtos disponíveis para venda!",
          ),
        },
        {
          id: uuidv4(),
          message: testValue(
            shippingMode,
            "Você precisa informar a modalidade do Mercado Envios para prosseguir.",
          ),
        },
      ]
        // Return a list only with of objects with error messages
        .filter(({ message }) => typeof message === "string")
    );
  }, []);

  const sweetAlertFormValidationErrors = useCallback(() => {
    if (errorList.length) {
      const ReactSwal = withReactContent(Swal);
      ReactSwal.fire({
        title: "Atenção!",
        type: "error",
        showCloseButton: true,
        showCancelButton: true,
        cancelButtonText: "Ok",
        showConfirmButton: false,
        html: (
          <ul>
            {errorList.map(error => (
              <li key={error.id}>{error.message}</li>
            ))}
          </ul>
        ),
      });
    }
  }, [errorList]);

  const validateCataloCharts = useCallback(() => {
    const typeHasAttributes = type => form.catalogCharts[type].charts?.length;
    if (typeHasAttributes("BRAND") || typeHasAttributes("STANDARD") || typeHasAttributes("SPECIFIC")) {
      return !!form.selectedChartRow;
    }

    return true;
  }, [form.catalogCharts, form.selectedChartRow]);

  const apiPayloadIsValid = useCallback(() => {
    const errorList = validateForm(apiPayload);
    if (errorList.length) {
      setErrorList(errorList);
      return false;
    }

    if (mustCreateCatalogAdvert() && !hasSelectedACatalogOption()) {
      if (!shouldEvaluateModerationEligibility) {
        setErrorList([
          {
            id: uuidv4(),
            message: "Selecione uma opção de catálogo para prosseguir.",
          },
        ]);
        return false;
      } else return true;
    }

    if (!validateCataloCharts()) {
      setErrorList([
        {
          id: uuidv4(),
          message:
            "Você precisa selecionar uma tabela de medidas. Em seguida, selecione a linha da tabela que corresponde aos atributos do seu produto.",
        },
      ]);
      return false;
    }

    return true;
  }, [
    apiPayload,
    hasSelectedACatalogOption,
    mustCreateCatalogAdvert,
    shouldEvaluateModerationEligibility,
    validateCataloCharts,
    validateForm,
  ]);

  async function handleCreateAdvertBtnClick() {
    if (showAdvertAbstraction) {
      const response = await fetchAdvertisingCreation(apiPayload);
      if (response?.data?.errors?.length) {
        await withReactContent(Swal).fire({
          title: "Atenção!",
          type: "error",
          html: (
            <>
              <h4>{response.data.message}</h4>
              {response.data.errors.length ? (
                response.data.errors.map(error => {
                  return (
                    <ul>
                      {error.details.cause.map((cause, index) => {
                        return <li key={index}>{cause.message}</li>;
                      })}
                    </ul>
                  );
                })
              ) : (
                <></>
              )}
            </>
          ),
        });
      } else if (response?.data?.status === "error") {
        await Swal.fire("Erro!", response.data?.message, response.data.status);
      } else if (response?.data?.data) {
        await Swal.fire("Atenção!", response.data.message, response.data.status);
        // connect catalog chart
        if (form.selectedChartRow) {
          const payload = {
            account_id: selectedAccounts.map(({ value }) => value)[0],
            chart_id: form.selectedChart,
            row_id: form.selectedChartRow,
            advertisings_id: response.data.data[0].id,
          };
          await linkChartRowWithAdverts(0, 1, payload);
        }
        history.push("/anuncios");
      } else {
        const ReactSwal = withReactContent(Swal);
        await ReactSwal.fire({
          title: "Erro!",
          type: "error",
          html: (
            <>
              <p>Não possível concluir a publicação deste anúncio.</p>
              {typeof response === "string" && <p>Motivo: {response}</p>}
            </>
          ),
        });
      }
    } else if (apiPayloadIsValid() && !showAdvertAbstraction) {
      setShowAdvertAbstraction(true);
    } else {
      sweetAlertFormValidationErrors();
    }
  }

  const disableSubmitButton = useMemo(() => !apiPayloadIsValid(), [apiPayloadIsValid]);
  const buttonClassName = classNames({ disabled: disableSubmitButton }, className);

  return (
    <CButton
      size="lg"
      color="primary"
      className={buttonClassName} // Shall not use "disabled" attribute. This way can show errors on press btn
      onClick={handleCreateAdvertBtnClick}
    >
      Criar anúncio&nbsp;
      <FaCheckCircle />
    </CButton>
  );
};

ConfirmAdvertCreationBtn.propTypes = {
  className: PropTypes.string,
};

export default ConfirmAdvertCreationBtn;
