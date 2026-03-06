import React from "react";
import Badge from "reactstrap/lib/Badge";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import api from "../../../../services/api";
import { getToken } from "../../../../services/auth";
import requests from "../../../Tags/requests";
import { toggleModalIsOpen } from "../../../../redux/actions/_tagsActions";
import {
  checkAdvert,
  saveAdverts,
  saveAdvertsPagination,
} from "../../../../redux/actions";
import { toast } from "react-toastify";
import { fetchAds } from "../../fetchAds";

export default function TagsRow({ advertiseId, tags }) {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(false);
  const { tagList } = useSelector((state) => {
    return {
      tagList: state.tags.tags,
    };
  });
  const toggleModal = () => dispatch(toggleModalIsOpen());

  async function handleClickRemoveTagBtn(tag) {
    setIsLoading(true);
    const tagObject = tagList.find((tagObject) => tagObject.name === tag);
    const url = `/tags/advertisings?confirmed=1&select_all=0`;
    const payload = {
      data: {
        type: "untag_advertisings",
        attributes: {
          tags: [tagObject.id],
          advertisings_id: [advertiseId],
        },
      },
    };
    const response = await api.delete(
      url,
      { data: payload },
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    );
    if (response.data.status === "success") {
      await fetchAds({
        page: 1,
        url: "sort_order=desc&free_shipping=1,0",
      }).then((response) => {
        if (response.data.status === "success") {
          toast("Sucesso ao atualizar os dados sobre anúncios.", {
            type: "success",
            autoClose: 3000,
            closeOnClick: false,
          });

          dispatch(saveAdverts(response.data.data));
          dispatch(saveAdvertsPagination(response.data.meta));
          setIsLoading(false);
        } else window.location.reload();
      });
    } else {
      Swal.fire({
        title: "Atenção",
        text: "Não foi possível salvar esta alteração, tente novamente.",
        type: "error",
        showCloseButton: true,
      });
      setIsLoading(false);
    }
  }

  async function handleClickAddTagBtn() {
    dispatch(checkAdvert({ id: advertiseId, checked: true, status: null }));
    await requests.getTagsFromAdvertise({
      dispatch,
      advertiseId: { list: [advertiseId] },
    });

    toggleModal();
  }

  return (
    <td
      id="tags-table-data"
      name="tags-table-data"
      key={Math.random()}
      className="advert-tags"
    >
      {tags.map((tag, index) => {
        return index <= 6 ? (
          tag ? (
            <Badge
              key={index}
              color="warning"
              id={tag + index}
              className="mr-1"
            >
              {tag}
              <span
                onClick={() => !isLoading && handleClickRemoveTagBtn(tag)}
                aria-hidden="true"
                className="ml-1"
                style={{ cursor: "pointer" }}
              >
                &times;
              </span>
            </Badge>
          ) : (
            <div key={index} />
          )
        ) : (
          <div key={index} />
        );
      })}
      <span className={`text-${tags[0] !== null ? "primary" : "success"}`}>
        <i
          onClick={handleClickAddTagBtn}
          style={{ cursor: "pointer" }}
          className={`fa fa-${tags[0] !== null ? "edit" : "plus-circle"} ml-1`}
        />
      </span>
    </td>
  );
}
