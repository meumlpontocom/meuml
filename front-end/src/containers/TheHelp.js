/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import $ from "jquery";
import Swal from "sweetalert2";
import api from "../services/api";
import { getToken } from "../services/auth";
import {
  CCard,
  CCollapse,
  CCardBody,
  CButton,
  CFormGroup,
  CLabel,
  CInput,
  CRow,
  CCol,
  CTextarea,
  CCardHeader,
} from "@coreui/react";
import "../scss/style.scss";
import { FaPlusCircle } from "react-icons/fa";

const TheHelp = () => {
  const [collapse] = useState(false);
  const [linkHelp, setLinkHelp] = useState("");
  const [titleHelp, setTitleHelp] = useState("");
  const [descHelp, setDescHelp] = useState("");
  const [linkEditHelp, setLinkEditHelp] = useState("");
  const [titleEditHelp, setTitleEditHelp] = useState("");
  const [descEditHelp, setDescEditHelp] = useState("");
  const [admin, setAdmin] = useState(false);
  const [questionFaq, setQuestionFaq] = useState([]);

  const getTag = ({ hash }) => {
    let tag = hash.replace("/", " ").replace("/", "_").replace("-", "_");

    const paramIndexStart = tag.indexOf("?");

    if (paramIndexStart !== -1) {
      tag = tag.slice(0, paramIndexStart);
    }

    return tag === " " ? "home" : tag.trim();
  };

  const dataQuestion = () => {
    api
      .get("faq", {
        params: { tag: getTag(window.location) },
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      .then(response => {
        setQuestionFaq(response.data.data);
      });
  };

  useEffect(() => {
    function handleHashChange() {
      dataQuestion();
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    dataQuestion();

    var is_admin = localStorage.getItem("is_admin");
    if (is_admin === "true") {
      is_admin = true;
    }
    setAdmin(is_admin);
  }, []);

  const handleLinkHelpChange = ({ target }) => {
    setLinkHelp(target.value);
  };

  const handleTitleHelpChange = ({ target }) => {
    setTitleHelp(target.value);
  };

  const handleDescHelpChange = ({ target }) => {
    setDescHelp(target.value);
  };

  const handleLinkEditHelpChange = ({ target }) => {
    setLinkEditHelp(target.value);
  };

  const handleTitleEditHelpChange = ({ target }) => {
    setTitleEditHelp(target.value);
  };

  const handleDescEditHelpChange = ({ target }) => {
    setDescEditHelp(target.value);
  };

  const toggle = id => {
    var idTag = "#collapseFaq" + id;

    $(idTag).toggle("slow");
  };

  const addHelp = () => {
    $(".contentNoneAddFaq").toggle("slow");
    $(".btnAddHelp").toggle("slow");
  };

  const cancelAddHelp = () => {
    $(".btnAddHelp").toggle("slow");
    $(".contentNoneAddFaq").toggle("slow");
  };

  const editHelp = (id, index) => {
    var collapse = ".contentCollapseFaq" + id;
    var collapseEdit = `.contentCollapseFaq${id}Edit`;

    const value = questionFaq[index];
    const cutLink = value.videol_url.split("embed/");
    setTitleEditHelp(value.question);
    setLinkEditHelp(cutLink[1]);
    setDescEditHelp(value.answer);

    $(collapseEdit).toggle("show");
    $(collapse).toggle("slow");
  };

  const cancelEditHelp = id => {
    var collapse = ".contentCollapseFaq" + id;
    var collapseEdit = `.contentCollapseFaq${id}Edit`;

    $(collapseEdit).toggle("show");
    $(collapse).toggle("slow");
  };

  const saveAddHelp = async () => {
    if (!titleHelp) {
      Swal.fire({
        title: "Atenção!",
        html: "<p>Preencha o título do vídeo.</p>",
        type: "error",
        showCloseButton: true,
      });

      return false;
    }

    // if (!linkHelp) {
    //   Swal.fire({
    //     title: "Atenção!",
    //     html: "<p>Preencha o link do vídeo.</p>",
    //     type: "error",
    //     showCloseButton: true,
    //   });

    //   return false;
    // }

    const fullLink = "https://www.youtube.com/embed/" + linkHelp;

    var dados = {
      hide_question: false,
      position: null,
      question: titleHelp,
      answer: descHelp,
      video_url: fullLink,
      tag: getTag(window.location),
    };

    try {
      await api.post("faq", dados, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      dataQuestion();

      setTitleHelp("");
      setLinkHelp("");
      setDescHelp("");

      $(".contentNoneAddFaq").toggle("slow");
      $(".btnAddHelp").toggle("slow");
    } catch (error) {
      Swal.fire({
        title: "Atenção!",
        html: "<p>Houve um erro ao salvar o FAQ atual.</p>",
        type: "error",
        showCloseButton: true,
      });

      return false;
    }
  };

  const saveEditHelp = async id => {
    var collapse = ".contentCollapseFaq" + id;
    var collapseEdit = `.contentCollapseFaq${id}Edit`;

    if (!titleEditHelp) {
      Swal.fire({
        title: "Atenção!",
        html: "<p>Preencha o título do vídeo.</p>",
        type: "error",
        showCloseButton: true,
      });

      return false;
    }

    // if (!linkEditHelp) {
    //   Swal.fire({
    //     title: "Atenção!",
    //     html: "<p>Preencha o link do vídeo.</p>",
    //     type: "error",
    //     showCloseButton: true,
    //   });

    //   return false;
    // }

    const fullLink = "https://www.youtube.com/embed/" + linkEditHelp;

    var dados = {
      hide_question: false,
      position: null,
      question: titleEditHelp,
      answer: descEditHelp,
      video_url: fullLink,
      tag: getTag(window.location),
    };

    try {
      await api.put(`faq/${id}`, dados, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      setTitleEditHelp("");
      setLinkEditHelp("");
      setDescEditHelp("");

      $(collapse).slideToggle("slow");
      $(collapseEdit).slideToggle("slow");

      dataQuestion();
    } catch (error) {
      Swal.fire({
        title: "Atenção!",
        html: "<p>Houve um erro ao salvar o FAQ atual.</p>",
        type: "error",
        showCloseButton: true,
      });

      return false;
    }
  };

  const [isDeleting, setIsDeleting] = React.useState(false);

  const deleteFaq = id => {
    setIsDeleting(id);
    const requestConfig = { headers: { Authorization: `Bearer ${getToken()}` } };
    api
      .delete(`faq/${id}`, requestConfig)
      .then(response => dataQuestion())
      .finally(() => setIsDeleting(false));
  };

  return (
    <>
      <hr className="hr-footer" />
      <div className="p-3">
        <h1 className="title-faq">Dúvidas mais frequentes</h1>

        {questionFaq &&
          questionFaq.map((item, index) => {
            return (
              <CCard className="rounded" key={item.id}>
                <CCardHeader
                  className="pointer d-flex justify-content-between"
                  onClick={() => toggle(item.id)}
                >
                  <CCol xs={12} sm={8}>
                    <h5>{item.question}</h5>
                  </CCol>
                  {admin === true && (
                    <CCol xs={12} sm={4} className="text-right">
                      <CButton
                        color={"success"}
                        size={"lg"}
                        variant={"outline"}
                        onClick={() => editHelp(item.id, index)}
                        className="mb-3"
                      >
                        Editar
                      </CButton>
                      &nbsp;&nbsp;
                      <CButton
                        color={"danger"}
                        size={"lg"}
                        variant={"outline"}
                        onClick={() => deleteFaq(item.id)}
                        className="mb-3"
                        disabled={isDeleting === item.id}
                      >
                        Excluir
                      </CButton>
                    </CCol>
                  )}
                </CCardHeader>
                <CCollapse className="rounded" id={"collapseFaq" + item.id} show={collapse}>
                  <CCardBody>
                    <div className={"contentCollapseFaq" + item.id}>
                      <pre
                        style={{
                          fontFamily: "inherit",
                          fontSize: "1rem",
                          maxWidth: "100%",
                          whiteSpace: "pre-wrap",
                          wordBreak: "normal",
                          wordWrap: "normal",
                        }}
                      >
                        {item.answer}
                      </pre>
                      {item.videol_url.split("embed/")[1] !== "" && (
                        <iframe
                          title="video"
                          width="100%"
                          height="500"
                          src={item.videol_url}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      )}
                    </div>

                    <div className={"contentCollapseFaq" + item.id + "Edit contentNone"}>
                      <CFormGroup className="text-left">
                        <CLabel className="text-dark" htmlFor="title-edit-help">
                          Título da ajuda
                        </CLabel>
                        <CInput
                          type="text"
                          value={titleEditHelp}
                          onChange={handleTitleEditHelpChange}
                          placeholder="Digite o título da ajuda"
                        />
                      </CFormGroup>

                      <CFormGroup>
                        <CLabel className="text-dark" htmlFor="link-edit-video">
                          ID do vídeo
                        </CLabel>
                        <CInput
                          type="link"
                          value={linkEditHelp}
                          onChange={handleLinkEditHelpChange}
                          placeholder="Digite o ID do vídeo"
                        />
                      </CFormGroup>

                      <CFormGroup>
                        <CLabel className="text-dark" htmlFor="desc-edit-help">
                          Descrição
                        </CLabel>
                        <CTextarea
                          rows="5"
                          value={descEditHelp}
                          onChange={handleDescEditHelpChange}
                          placeholder="Digite a desscrição da ajuda"
                        />
                      </CFormGroup>

                      <CRow>
                        <CCol xs="6">
                          <CButton color="success" size="lg" onClick={() => saveEditHelp(item.id)}>
                            Salvar
                          </CButton>
                        </CCol>
                        <CCol xs="6">
                          <CButton color="danger" size="lg" onClick={() => cancelEditHelp(item.id)}>
                            Cancelar
                          </CButton>
                        </CCol>
                      </CRow>
                    </div>
                  </CCardBody>
                </CCollapse>
              </CCard>
            );
          })}

        <div className="contentNoneAddFaq">
          <CCard className="rounded">
            <CCollapse className="rounded" show={true}>
              <CCardBody>
                <CFormGroup className="text-left">
                  <CLabel className="text-dark" htmlFor="title-help">
                    Título da ajuda
                  </CLabel>
                  <CInput
                    type="text"
                    value={titleHelp}
                    onChange={handleTitleHelpChange}
                    placeholder="Digite o título da ajuda"
                  />
                </CFormGroup>

                <CFormGroup>
                  <CLabel className="text-dark" htmlFor="link-video">
                    ID do vídeo
                  </CLabel>
                  <CInput
                    type="link"
                    value={linkHelp}
                    onChange={handleLinkHelpChange}
                    placeholder="Digite o ID do vídeo"
                  />
                </CFormGroup>

                <CFormGroup>
                  <CLabel className="text-dark" htmlFor="desc-help">
                    Descrição
                  </CLabel>
                  <CTextarea
                    rows="5"
                    value={descHelp}
                    onChange={handleDescHelpChange}
                    placeholder="Digite a desscrição da ajuda"
                  />
                </CFormGroup>
              </CCardBody>
            </CCollapse>
          </CCard>

          <CRow>
            <CCol xs="6">
              <CButton block color={"success"} size={"lg"} onClick={saveAddHelp}>
                Salvar
              </CButton>
            </CCol>

            <CCol>
              <CButton block xs="6" color={"danger"} size={"lg"} onClick={cancelAddHelp}>
                Cancelar
              </CButton>
            </CCol>
          </CRow>
        </div>

        {admin === true && (
          <CButton color="success" size="lg" className="btnAddHelp" onClick={addHelp}>
            <FaPlusCircle className="mb-1" />
            &nbsp; Adicionar ajuda
          </CButton>
        )}
      </div>
    </>
  );
};

export default React.memo(TheHelp);
