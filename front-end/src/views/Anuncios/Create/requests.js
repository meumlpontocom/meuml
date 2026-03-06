import api, { headers } from "src/services/api";
import { toast }        from "react-toastify";
import Swal             from "sweetalert2";


export async function fetchPredictCategory({ advertTitle }) {
  try {
    const url = `/category-predictor?title=${advertTitle}`;
    const response = await api.get(url, headers());
    return response.data;
  } catch (error) {
    return error?.response || error.message;
  }
}

export async function fetchNavigateCategoryTree({ categoryId }) {
  try {
    const url = `/categories-tree?category_id=${categoryId}&include_attributes=1`;
    const response = await api.post(url, {}, headers());
    return response.data;
  } catch (error) {
    return error?.response || error.message;
  }
}

export async function fetchCatalogSearchProduct({ title, domainId }) {
  try {
    const url = `/catalog/search-product?title=${title}&domain_id=${domainId}`;
    const response = await api.get(url, headers());
    return response.data;
  } catch (error) {
    return error?.response || error.message;
  }
}

export const uploadFileToMeLi = async ({ file, accountId }) => {
  const showUploadErrorMessage = async error => {
    const errorMessage =
      error?.response?.data?.message ||
      "Algo deu errado ao enviar suas imagens para o Mercado Livre. Tente novamente.";
    await Swal.fire({
      title: "Atenção!",
      type: "error",
      text: errorMessage,
      showCancelButton: true,
      showConfirmButton: false,
      showCloseButton: true,
      cancelButtonText: "Fechar",
    });
  };
  try {
    const url = "/images/meli/upload";
    const payload = new FormData();

    payload.append("image", file);
    payload.append("title", file.name);
    payload.append("account_id", accountId[0]);

    const response = await api.post(url, payload, headers());

    if (response.data.status === "success") return response.data.data.id;
    else await showUploadErrorMessage();
  } catch (error) {
    await showUploadErrorMessage(error);
  }
};

async function fetchCreateMShopsAdvert(payload, accounts) {
  try {
    const url = "/mshops/advertisings/create";
    payload.data.attributes.channels = payload.data.attributes.create_classic_advertising
      ? ["mshops", "marketplace"]
      : ["mshops"];
    return await Promise.all(
      accounts.map(async account_id => {
        const config = headers();
        payload.data.attributes.account_id = account_id;
        const response = await api.post(url, payload, config);
        return { id: account_id, response };
      }),
    );
  } catch (error) {
    return error?.response || error.message;
  }
}

export async function fetchAdvertisingCreation(props) {
  try {
    const {
      title,
      price,
      pictures,
      condition,
      attributes,
      variations,
      description,
      accountId,
      categoryId,
      shippingMode,
      listingTypeId,
      availableQuantity,
      createClassicAdvert,
      createCatalogAdvert,
      catalogId,
      checkedMShopsAccounts,
      evaluateEligibility
    } = props;

    let requiredAttributeNotFilled = false; // Error is True when a required attribute's value is not filled;

    // Send each img to ML's api in return of a url to the file on the web
    const picturesUrls = await Promise.all(pictures.map(file => uploadFileToMeLi({ file, accountId })));

    // Toast warning attribute name if has "required" in "tags"
    const warnRequiredAttributeNotInformed = attribute => {
      if (attribute?.tags.required) {
        requiredAttributeNotFilled = true;
        toast(`Certifique-se de preencher o atributo obrigatório ${attribute.name}.`, {
          type: toast.TYPE.WARNING,
          autoClose: false,
        });
      }
    };

    // Remove all keys that are unnecessary and remove key/value if undefined
    const cleanupAttributeObject = ({ id, name, value_name, value_id }) => {
      const attribute = { id, name, value_name, value_id };

      Object.keys(attribute).forEach(key => {
        if (!attribute[key]) {
          warnRequiredAttributeNotInformed(attribute[key]);
          delete attribute[key];
        }
      });

      return attribute;
    };

    // MeuML.com API payload
    const advert = {
      data: {
        type: "advertising",
        attributes: {
          title,
          price,
          pictures: picturesUrls,
          condition,
          attributes: attributes.reduce(
            (validated, attribute) =>
              attribute.value_name ? [...validated, cleanupAttributeObject(attribute)] : validated,
            [],
          ),
          variations,
          description,
          account_id: accountId,
          category_id: categoryId,
          shipping_mode: shippingMode,
          listing_type_id: listingTypeId,
          available_quantity: availableQuantity,
          create_classic_advertising: createClassicAdvert,
          create_catalog_advertising: createCatalogAdvert,
          catalog_id: catalogId,
          evaluate_eligibility: evaluateEligibility
        },
      },
    };
    const imageValidation = !!advert.data.attributes.pictures.filter(pic => !!pic)?.length === true;

    const createAdvert = async payload => {
      const url = "/advertisings/create";
      return await api.post(url, payload, headers());
    };

    // If everithing is fine with API's prerequisites
    if (!requiredAttributeNotFilled && imageValidation) {
      const selectedMShopsAccounts = Object.keys(checkedMShopsAccounts).filter(
        accountId => checkedMShopsAccounts[accountId],
      );

      // If should publish ad in MShops
      if (selectedMShopsAccounts.length) {
        const payload = advert;
        delete payload.data.attributes["catalog_id"];
        delete payload.data.attributes["create_catalog_advertising"];
        payload.data.attributes.mshops_price = payload.data.attributes.price;

        const createMShopsAdvertResponse = await fetchCreateMShopsAdvert(payload, selectedMShopsAccounts);

        if (createMShopsAdvertResponse[0].response.data.status === "success") {
          const mlShopsMessage = `${createMShopsAdvertResponse.map(
            ({ id, response }) => `${id} ${response.data.message}\n`,
          )}`;

          // If should publish ad in ML Catalog as well
          if (advert.data.attributes.create_catalog_advertising) {
            const payload = advert;
            payload.data.attributes.create_classic_advertising = false;
            const response = await createAdvert(payload);
            return {
              ...response,
              data: {
                ...response.data,
                message: `${mlShopsMessage}\n${response.data.message}`,
              },
            };
          } else {
            return {
              data: {
                data: [advert],
                status: "success",
                message: mlShopsMessage,
              },
            };
          }
        } else {
          return createMShopsAdvertResponse?.data?.message || createMShopsAdvertResponse;
        }
        // If should not create MShops and should create ML's classic and/or catalog ad.
      } else {
        return await createAdvert(advert);
      }
    } else if (!imageValidation) {
      return "Envie pelo menos uma imagem do seu produto.";
    } else {
      return 'Parece que algum atributo obrigatório da categoria deste anúncio não foi preenchido corretamente. Por favor, clique em "voltar" e verifique na lista de atributos obrigatórios.';
    }
  } catch (error) {
    return error?.response || error.message;
  }
}
