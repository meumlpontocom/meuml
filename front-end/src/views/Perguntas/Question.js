import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import Swal from "sweetalert2";
import {
  clearAnsweredQuestion,
  saveAnsweredQuestionMsg,
} from "../../redux/actions";
import { getToken } from "../../services/auth";

export default function Question({
  questions,
  title,
  value,
  shipping,
  available,
  listingType,
  thumb,
  token,
  accountName,
  adIndex,
  refreshApi,
}) {
  const dispatch = useDispatch();
  const [answer, setAnswer] = useState("");
  const [toggleTextArea, setToggleTextArea] = useState([]);
  const [toggleModal, setToggleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkBox, setCheckBox] = useState({
    remove: false,
    blockNewQuestion: false,
    blockBuyer: false,
  });

  const handleToast = ({ type, status }) => {
    const reset = { type: "error", status: undefined };
    dispatch(saveAnsweredQuestionMsg({ type, status }));
    dispatch(saveAnsweredQuestionMsg({ ...reset }));
  };
  const answerQuestion = async ({ seller_id, index, id }) => {
    try {
      const url = `${process.env.REACT_APP_API_URL}/questions/answer`;
      const header = { headers: { Authorization: `Bearer ${token}` } };
      const answerObject = {
        account_id: seller_id.toString(),
        question_id: id.toString(),
        text: answer,
      };

      const response = await axios.post(url, answerObject, header);

      if (response?.status === 200) {
        handleToast({ status: response.data.meta.msg, type: "success" });
        dispatch(clearAnsweredQuestion({ seller_id, index, adIndex }));
      } else {
        handleToast({
          type: "success",
          status:
            "Ops, algo deu errado!</p><p>Atualize a pagina e tente novamente. Se o erro persistir, verifique sua conexao ou contate o suporte.",
        });
      }
    } catch (error) {
      handleToast({
        type: "error",
        status:
          error.response?.data.message !== undefined
            ? error.response.data.message
            : "Nao foi possivel atualizar os dados.",
      });
    }
  };

  const removeQuestion = async ({
    seller_id,
    index,
    id,
    checkBox: field,
    from: idUser,
  }) => {
    try {
      setLoading(true);
      const urlRemove = `${
        process.env.REACT_APP_API_URL
      }/questions/${id.toString()}?${seller_id.toString()}`;
      const urlBlockUserQuestion = `${
        process.env.REACT_APP_API_URL
      }/questions/${id.toString()}/block/user?bids=${
        field.blockBuyer ? 1 : 0
      }&questions=${field.blockNewQuestion ? 1 : 0}`;
      const header = { headers: { Authorization: `Bearer ${getToken()}` } };
      const answerObject = {
        account_id: seller_id.toString(),
        user_id: idUser.toString(),
      };
      let response;
      if (field.remove) {
        response = await axios.delete(urlRemove, header);
      }
      if (field.blockNewQuestion || field.blockNewQuestion) {
        response = await axios.post(urlBlockUserQuestion, answerObject, header);
      }

      Swal.fire({
        title: "Sucesso!",
        html: `${response.data.data.map((item) => `<p>${item}</p>`)}`,
        type: "success",
        showCloseButton: true,
      });
      refreshApi();
    } catch (error) {
      handleToast({
        type: "error",
        status:
          error.response?.data.message !== undefined
            ? error.response.data.message
            : "Nao foi possivel atualizar os dados.",
      });
    } finally {
      setLoading(false);
    }
  };

  const changeCheckBox = (event, field) => {
    setCheckBox({ ...checkBox, [field]: event.target.checked });
  };

  const handleToggleTextArea = (questId) => {
    const filteredToggleArray = toggleTextArea.filter(
      (question) => question === questId
    );
    if (filteredToggleArray.length !== 0) {
      setToggleTextArea(
        toggleTextArea.filter((question) => question !== questId)
      );
    } else setToggleTextArea([...toggleTextArea, questId]);
  };

  const handleToggleModal = (open) => {
    if (open) return setToggleModal(open);

    setToggleModal(false);
  };

  const isDisabled = (id) =>
    toggleTextArea.filter((x) => x === id).length !== 0;

  return (
    <Row style={{ justifyContent: "center" }}>
      <Col sm="12" md="8" lg="8" xs="12">
        <Col
          sm="12"
          md="12"
          lg="12"
          xs="12"
          style={{
            backgroundColor: "#cccccc",
            marginBottom: "2em",
            marginTop: "2em",
          }}
        >
          <span
            style={{ color: "#20A8D8", fontWeight: "normal", fontSize: "22px" }}
          >
            {accountName.toUpperCase()}
          </span>
        </Col>
        <Card className="card-accent-primary">
          <CardHeader>
            <Row>
              <Col sm="2" md="2" lg="2" xs="2">
                <img
                  src={thumb}
                  alt="Imagem do anúncio"
                  id="advertisingThumbnail"
                  name="advertisingThumbnail"
                  style={{ width: "75px" }}
                />
              </Col>
              <Col sm="10" md="10" lg="10" xs="12">
                <h6>
                  <strong>
                    {title.toUpperCase()} - {value}
                  </strong>
                </h6>
                <p style={{ color: "gray" }}>
                  <small>
                    {listingType} -{" "}
                    {shipping ? `Frete Grátis` : "Sem Frete Grátis"} -{" "}
                    {available !== 0
                      ? available > 1
                        ? `${available} disponiveis`
                        : `${available} disponivel`
                      : "Nenhum disponivel"}
                  </small>
                </p>
              </Col>
            </Row>
          </CardHeader>
          <CardBody style={{ marginTop: "-25px" }}>
            <hr />
            <h5>
              {questions.map((question, index) => {
                const { seller_id, id, nickname, from } = question;
                return (
                  <div
                    key={index}
                    style={{ backgroundColor: "#faf5f8", color: "gray" }}
                    className="callout callout-secondary b-t-1 b-r-1 b-b-1"
                    onClick={() =>
                      toggleTextArea.length === 0 && handleToggleTextArea(index)
                    }
                  >
                    <span>
                      <h6
                        style={{
                          fontSize: 12,
                          color: "#054785",
                          fontWeight: "bold",
                          marginTop: "8px",
                        }}
                      >
                        {nickname}
                      </h6>
                    </span>
                    <Row
                      style={{
                        justifyContent: "space-between",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        className="text-muted"
                        style={{ padding: "5px 15px", fontSize: 12 }}
                      >
                        {toggleTextArea[index] === undefined ? (
                          <i className="cil-level-down" />
                        ) : (
                          <i className="cil-level-up" />
                        )}
                        {question.text}
                      </span>
                      <span
                        style={{
                          padding: "5px 15px",
                          fontSize: 12,
                        }}
                      >
                        <strong>
                          {new Date(question.date_created).toLocaleString(
                            "pt-br"
                          )}
                        </strong>
                      </span>
                    </Row>
                    <Col
                      sm="12"
                      md="10"
                      lg="10"
                      xs="12"
                      className="mt-3"
                      hidden={!isDisabled(index)}
                    >
                      <textarea
                        id="answerTextArea"
                        name="answerTextArea"
                        className="form-control"
                        placeholder="Escreva aqui sua resposta"
                        onChange={(event) => setAnswer(event.target.value)}
                      />
                      <Row className="mb-3">
                        <Col className="text-left mt-2">
                          <Button
                            color="secondary"
                            size="sm"
                            onClick={() => handleToggleTextArea(index)}
                          >
                            <i className="cil-arrow-circle-top mr-1" />
                            Cancelar
                          </Button>
                        </Col>
                        <Col className="text-left mt-2">
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => handleToggleModal(id)}
                          >
                            <i className="cil-ban mr-1" />
                            Excluir/Bloquear
                          </Button>
                        </Col>
                        <Modal
                          isOpen={toggleModal === id}
                          toggle={handleToggleModal}
                        >
                          <ModalHeader toggle={handleToggleModal}>
                            Deseja excluir/bloquear?
                          </ModalHeader>
                          {loading ? (
                            "loading..."
                          ) : (
                            <>
                              <ModalBody>
                                <Form>
                                  <FormGroup check>
                                    <Label check>
                                      <Input
                                        type="checkbox"
                                        onChange={(e) =>
                                          changeCheckBox(e, "remove")
                                        }
                                        checked={checkBox.remove}
                                      />{" "}
                                      Excluir pergunta
                                    </Label>
                                  </FormGroup>
                                  <FormGroup check>
                                    <Label check>
                                      <Input
                                        type="checkbox"
                                        onChange={(e) =>
                                          changeCheckBox(e, "blockNewQuestion")
                                        }
                                        checked={checkBox.blockNewQuestion}
                                      />{" "}
                                      Bloquear comprador para novas perguntas
                                    </Label>
                                  </FormGroup>
                                  <FormGroup check>
                                    <Label check>
                                      <Input
                                        type="checkbox"
                                        onChange={(e) =>
                                          changeCheckBox(e, "blockBuyer")
                                        }
                                        checked={checkBox.blockBuyer}
                                      />{" "}
                                      Bloquear comprador para compras
                                    </Label>
                                  </FormGroup>
                                </Form>
                              </ModalBody>
                              <ModalFooter>
                                <Button
                                  color="secondary"
                                  onClick={handleToggleModal}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  color="primary"
                                  onClick={() =>
                                    removeQuestion({
                                      seller_id,
                                      id,
                                      index,
                                      checkBox,
                                      from,
                                    })
                                  }
                                >
                                  Excluir/bloquear
                                </Button>{" "}
                              </ModalFooter>{" "}
                            </>
                          )}
                        </Modal>
                        <Col className="text-right mt-2">
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() =>
                              answerQuestion({ seller_id, id, index })
                            }
                          >
                            <i className="cil-send mr-1" />
                            Responder
                          </Button>
                        </Col>
                      </Row>
                    </Col>
                  </div>
                );
              })}
            </h5>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}
