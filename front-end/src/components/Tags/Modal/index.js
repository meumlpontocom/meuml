/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleModalIsOpen,
  saveModalInputValue,
  clearNewTagList,
  saveSelectedAdTagList,
  clearHiddenTags,
} from "../../../redux/actions/_tagsActions";
import Button from "reactstrap/lib/Button";
import Modal from "reactstrap/lib/Modal";
import ModalHeader from "reactstrap/lib/ModalHeader";
import ModalBody from "reactstrap/lib/ModalBody";
import TagList from "./TagList";
import TagInput from "./TagInput";
import "./styles.scss";
import requests from "../requests";
import getSelectedAdverts from "../getSelectedAdverts";
import { uncheckAllAdverts, saveAdverts, saveAdvertsPagination } from "../../../redux/actions";
import { fetchAds } from "../../Adverts/fetchAds";
import { toast } from "react-toastify";

const TagModal = () => {
  const dispatch = useDispatch();

  const adverts = useSelector(getSelectedAdverts);

  const filters = useSelector(({ advertsURL }) => advertsURL);

  const { notSavedTags, modalIsOpen, hiddenTags, isLoading, tags } = useSelector(
    ({ tags: { tags, isLoading, hiddenTags, modalIsOpen, notSavedTags } }) => ({
      notSavedTags,
      modalIsOpen,
      hiddenTags,
      isLoading,
      tags,
    }),
  );

  const toggleModal = () => dispatch(toggleModalIsOpen());

  async function saveAndClose() {
    toggleModal();
    if (hiddenTags.length) {
      await requests
        .deleteTags({
          tags: [...hiddenTags.map(({ id }) => id)],
          confirmed: 1,
          dispatch,
          selectAll: 0,
          advertising: adverts,
          filters,
        })
        .then(async promise => {
          await fetchAds({
            page: 1,
            url: "sort_order=desc&free_shipping=1,0",
          }).then(response => {
            if (response.data.status === "success") {
              toast("Sucesso ao atualizar os dados sobre anúncios.", {
                type: "success",
                autoClose: 3000,
                closeOnClick: false,
              });

              dispatch(saveAdverts(response.data.data));
              dispatch(saveAdvertsPagination(response.data.meta));
            } else window.location.reload();
          });
        });
    }

    if (notSavedTags.length) {
      await requests
        .createTagOnAdvert({
          dispatch,
          advertising: adverts,
          tags: {
            previous: tags,
            current: notSavedTags,
          },
          confirmed: 1,
          filters,
        })
        .then(async promise => {
          await fetchAds({
            page: 1,
            url: "sort_order=desc&free_shipping=1,0",
          }).then(response => {
            if (response.data.status === "success") {
              toast("Sucesso ao atualizar os dados sobre anúncios.", {
                type: "success",
                autoClose: 3000,
                closeOnClick: false,
              });

              dispatch(saveAdverts(response.data.data));
              dispatch(saveAdvertsPagination(response.data.meta));
            } else window.location.reload();
          });
        });
    }
  }

  function cancel() {
    toggleModal();
  }

  React.useEffect(() => {
    if (!modalIsOpen) {
      if (adverts.list.length === 1) dispatch(uncheckAllAdverts());
      dispatch(clearHiddenTags());
      dispatch(clearNewTagList());
      dispatch(saveModalInputValue(""));
      dispatch(saveSelectedAdTagList([]));
    }
  }, [modalIsOpen, dispatch]);

  return (
    <>
      <div>
        <Modal isOpen={modalIsOpen} toggle={toggleModal} centered>
          <ModalHeader toggle={toggleModal}>Tags</ModalHeader>
          <ModalBody>
            <div>
              <p className="text-muted">Adicione uma ou mais tags para organizar seus anúncios</p>
            </div>
            <div className="p-1 rounded border mb-3 tags-box">
              <ul className="list-inline mb-1">
                <TagList />
              </ul>
            </div>
            <div className="mb-2">
              <TagInput />
            </div>
            <div className="d-flex justify-content-end">
              <Button disabled={isLoading} color="secondary" size="sm" className="ml-2" onClick={cancel}>
                Cancelar
              </Button>
              <Button disabled={isLoading} color="primary" size="sm" className="ml-2" onClick={saveAndClose}>
                Salvar e sair
              </Button>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </>
  );
};

export default TagModal;
