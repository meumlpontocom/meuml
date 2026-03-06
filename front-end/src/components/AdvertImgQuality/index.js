import React, { useEffect, useState } from "react";
import Card from "reactstrap/lib/Card";
import CardHeader from "reactstrap/lib/CardHeader";
import CardFooter from "reactstrap/lib/CardFooter";
import api from "../../services/api";
import { getToken } from "../../services/auth";
import Swal from "sweetalert2";
import Body from "./Body";
import { Link } from "react-router-dom";
import { Provider } from "./imageQualityContext";

export default function AdvertImgQuality({ location }) {
  const { advertId, accountId, secureThumbnail } = location?.state;
  const [isLoading, setIsLoading] = useState(true);
  const [pictures, setPictures] = useState([]);
  const [advertData, setAdvertData] = useState({});
  const [thumbnailConditions, setThumbnailConditions] = useState([]);
  const handleError = ({ error }) => {
    if (error.response) {
      Swal.fire({
        title: "Atenção!",
        html: `<p>${error.response.data?.message}</p>`,
        type: error.response.data?.status,
        showCloseButton: true,
      });
    } else {
      Swal.fire({
        title: "Atenção!",
        html: `<p>${error.message ? error.message : error}</p>`,
        type: "error",
        showCloseButton: true,
      });
    }
  };

  useEffect(() => {
    async function fetchCheckImagesStatus() {
      const url = `/images/meli/quality?account_id=${accountId}&advertising_id=${advertId}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const { conditions } = response.data.data;
      setThumbnailConditions(conditions);
    }
    async function fetchAdvertImages() {
      const url = `/advertisings/images?advertising_id=${advertId}`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const {
        pictures,
        category_id,
        free_shipping,
        id,
        listing_type_id,
        permalink,
        price,
        shipping_mode,
        sold_quantity,
        status,
        title,
      } = response.data.data;
      setPictures(pictures);
      setAdvertData({
        category_id,
        free_shipping,
        id,
        listing_type_id,
        permalink,
        price,
        shipping_mode,
        sold_quantity,
        status,
        title,
      });
    }
    async function handleResquests() {
      try {
        await fetchAdvertImages();
        await fetchCheckImagesStatus();
      } catch (error) {
        handleError({ error });
      } finally {
        setIsLoading(false);
      }
    }
    handleResquests();
  }, [advertId, accountId]);

  return (
    <Provider
      value={{
        ...advertData,
        isLoading,
        thumbnailConditions,
        pictures,
        secureThumbnail,
      }}
    >
      <Card>
        <CardHeader>
          <h4 className="text-primary">Qualidade das Imagens</h4>
        </CardHeader>
        <Body />
        <CardFooter>
          <Link
            style={{ float: "left" }}
            className="btn btn-secondary mt-5"
            to="/qualidade-do-anuncio"
          >
            <i className="cil-arrow-left mr-1" /> Voltar
          </Link>
        </CardFooter>
      </Card>
    </Provider>
  );
}
