import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "src/services/api";
import { getToken } from "src/services/auth";

const ReactSwal = withReactContent(Swal);

class Requests {
  constructor(setIsLoading, advertisingId, history) {
    this.advertisingId = advertisingId;
    this.goBack = () => history.goBack();
    this.setLoading = (boolean) => setIsLoading(boolean);
    this.fetchAdvertisingData = this.fetchAdvertisingData.bind(this);
    this.advertisingObject = { attributes: [] };
  }

  async fetchAdvertisingData() {
    try {
      if (this.advertisingId) {
        this.setLoading(true);
        const config = { headers: { Authorization: `Bearer ${getToken()}` } };
        const url = `/advertisings/${this.advertisingId}`;
        const response = await api.get(url, config);
        if (response.data?.data) {
          this.setLoading(false);
          return response.data.data;
        } else {
          Swal.fire({
            title: "Atenção!",
            text:
              response?.data.message ||
              "Não foi possível recuperar informações sobre o anúncio. Tente novamente em alguns minutos.",
            type: "error",
            showCloseButton: true,
          });
          this.goBack();
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Atenção!",
        text: error.response?.data.message || error.message,
        type: "error",
        showCloseButton: true,
      });
      this.setLoading(false);
      return null;
    }
  }

  async fetchUploadImage(picture, accountId) {
    try {
      if (accountId) {
        this.setLoading(true);
        const formData = new FormData();
        formData.append("account_id", accountId);
        formData.append("title", Date.now());
        formData.append("image", picture);
        const {
          data: { data, message, status },
        } = await api.post("/images/meli/upload", formData, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        Swal.fire({
          title: "Atenção!",
          text: message,
          type: status,
          showCloseButton: true,
        });
        return data;
      }
    } catch (error) {
      this.setLoading(false);
      console.error(error);
      Swal.fire({
        title: "Erro!",
        text: error.response?.data?.errors?.message || error.message,
        type: "error",
        showCloseButton: true,
      });
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  mountAdvertMainDataObject(data) {
    const keysList = Object.keys(data);
    keysList.forEach((key) => {
      if (key === "description-input") {
        this.advertisingObject["description"] = {
          plain_text: data[key].current.value,
        };
      } else if (key === "shipping-input") {
        this.advertisingObject["shipping"] = {
          free_shipping: data[key].current.value,
        };
      } else if (key !== (undefined || String(undefined))) {
        const advertDataKey = key.split("-input")[0];
        const userInputValue = data[key].current.value; // from REF
        this.advertisingObject[advertDataKey] = userInputValue;
      } else {
        const advertDataKey = data[key].current.props.id.split("-input")[0];
        const userInputValue = data[key].current.props.value;
        this.advertisingObject[advertDataKey] = userInputValue;
      }
    });
  }

  mountAdvertAttributesDataObject(data) {
    const keysList = Object.keys(data);
    keysList.forEach((key) => {
      const keyName = key.search("/") > 0 ? key.split("/")[1] : key;
      if (data[key].search("}") === data[key].length - 1) {
        const { id, name } = JSON.parse(Object(data[key]));
        this.advertisingObject.attributes.push({
          value_name: name,
          value_id: id,
          id: keyName,
        });
      } else {
        this.advertisingObject.attributes.push({
          value_name: data[key],
          id: keyName,
        });
      }
    });
  }

  async updateAdvertising({ formData, advertMainInfo, advertPictures }) {
    try {
      this.setLoading(true);
      const config = { headers: { Authorization: `Bearer ${getToken()}` } };
      this.mountAdvertMainDataObject(advertMainInfo);
      this.mountAdvertAttributesDataObject(formData);
      const payload = {
        data: {
          type: "advertising_update",
          attributes: {
            ...this.advertisingObject,
            pictures: advertPictures,
          },
        },
      };

      if (!Object.keys(payload.data.attributes.attributes).length) {
        delete payload.data.attributes.attributes;
      }

      const response = await api.put(
        `/advertisings/${this.advertisingId}`,
        payload,
        config
      );
      if (response.data.status) {
        const success = response.data.status === "success";
        Swal.fire({
          title: success ? "Sucesso!" : "Atenção!",
          type: success ? "success" : "warning",
          showCloseButton: true,
        });
      }
      this.setLoading(false);
    } catch (error) {
      const errorList = error.response?.data?.data?.errors;
      if (errorList?.length) {
        ReactSwal.fire({
          title: "Atenção!",
          type: "error",
          showCloseButton: true,
          html: (
            <ul style={{ listStyleType: "none" }}>
              {errorList.map((error, idx) => (
                <li key={idx}>
                  <h5 className="text-danger">Erro: {error.detail}</h5>
                  <p>Local: {error.source.pointer}</p>
                </li>
              ))}
            </ul>
          ),
        });
      } else {
        Swal.fire({
          title: "Atenção!",
          text: error.response?.data.message || error.message,
          type: "error",
          showCloseButton: true,
        });
      }
      this.setLoading(false);
    }
  }
}

export default Requests;
