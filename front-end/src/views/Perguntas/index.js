/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from "react";
import { saveQuestionsToBeAnswered } from "../../redux/actions";
import { useSelector, useDispatch } from "react-redux";
import { getToken } from "../../services/auth";
import Question from "./Question";
import Loading from "../../components/Loading";
import Swal from "sweetalert2";
import axios from "axios";
import AnswerStatusMsg from "./AnswerStatusMsg";
import CallToAction from "../CallToAction";
import checkForSubscription from "../../helpers/checkForSubsription";
import Row from "reactstrap/lib/Row";
import Col from "reactstrap/lib/Col";
import Button from "reactstrap/lib/Button";
import AccountsDropdown from "src/components/AccountsDropdown";

export default function Perguntas() {
  const [loading, setLoading] = useState(true);
  const [userIsNotSub, setUserIsNotSub] = useState(false);

  const selectedAccounts = useSelector(state => state.accounts.selectedAccounts);
  const questions = useSelector(state => state.questions);
  const dispatch = useDispatch();
  const fetchApi = async ({ url }) => {
    try {
      const fetchUrl = `${process.env.REACT_APP_API_URL}${url}`;
      const headers = { headers: { Authorization: `Bearer ${getToken()}` } };
      return await axios.get(fetchUrl, headers);
    } catch (error) {
      return error;
    }
  };

  const somethinWentWrongAlert = () => {
    return Swal.fire({
      title: "Atencao!",
      html: "<p>Algo inesperado ocorreu.</p>",
      type: "warning",
      showCloseButton: true,
    });
  };

  const handleFetchApi = useCallback(
    requestCategory => {
      setLoading(true);
      const fetchAllQuestions = async () => {
        try {
          return await fetchApi({ url: "/questions?" })
            .then(response => response)
            .catch(error => error);
        } catch (error) {
          return error;
        }
      };
      const fetchSelectedAccQuestions = async () => {
        try {
          const selected = selectedAccounts.map(acc => acc.value);
          return await fetchApi({
            url: `/questions?account_id=${selected}`,
          })
            .then(response => response)
            .catch(error => error);
        } catch (error) {
          return error;
        }
      };
      if (requestCategory === "filterBySelectedAccounts") {
        fetchSelectedAccQuestions().then(response => {
          switch (response.status) {
            case 200:
              dispatch(saveQuestionsToBeAnswered({ ...response.data }));
              setLoading(false);
              break;
            default:
              somethinWentWrongAlert();
              break;
          }
        });
      } else {
        fetchAllQuestions().then(response => {
          switch (response.status) {
            case 200:
              dispatch(saveQuestionsToBeAnswered({ ...response.data }));
              setLoading(false);
              break;
            default:
              somethinWentWrongAlert();
              break;
          }
        });
      }
    },
    [dispatch, selectedAccounts],
  );

  const checkSubscription = async () => {
    return await checkForSubscription({ module: 8 })
      .then(boolean => {
        setUserIsNotSub(!boolean);
        if (boolean) handleFetchApi();
      })
      .catch(error => error);
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const questionsState = {
    getAdverts: () => {
      let advertArray = [];
      for (const question in questions.data) {
        const questionObject = questions.data[question];
        if (questionObject.total_questions !== 0) {
          const advertisings = [...questionObject.advertisings];
          advertArray.push(...advertisings);
        }
      }
      return advertArray !== undefined ? [...advertArray] : [];
    },
  };

  const NoQuestionTitle = () => {
    return (
      <p className="text-center mt-5" style={{ color: "gray" }}>
        <h5>Não há perguntas para serem respondidas.</h5>
        <h6 className="mt-3">
          <span style={{ cursor: "pointer" }} onClick={() => handleFetchApi()}>
            <i className="cil-sync" /> Atualizar
          </span>
        </h6>
      </p>
    );
  };

  const Advertising = () => {
    const adverts = questionsState.getAdverts();
    if (adverts.length !== 0) {
      return adverts.map((advertising, index) =>
        advertising ? (
          advertising.questions?.length !== 0 ? (
            <Question
              id={index}
              key={index}
              adIndex={index}
              token={getToken()}
              title={advertising.title}
              value={advertising.price}
              thumb={advertising.thumbnail}
              questions={advertising.questions}
              shipping={advertising.free_shipping}
              accountName={advertising.accountName}
              listingType={advertising.listing_type}
              available={advertising.quantity_available}
              refreshApi={() => handleFetchApi()}
            />
          ) : null
        ) : (
          <NoQuestionTitle />
        ),
      );
    }
    return <NoQuestionTitle />;
  };

  return userIsNotSub ? (
    <CallToAction />
  ) : loading ? (
    <Loading />
  ) : (
    <>
      <Row style={{ justifyContent: "center" }}>
        <Col sm="12" md="8" lg="8" xs="12">
          <Row style={{ justifyContent: "center" }}>
            <AccountsDropdown platform="ML" multiple={true} xs="10" />
            <Col xs="2" style={{ paddingRight: 0, paddingLeft: 0 }}>
              <Button
                color="primary"
                style={{ float: "right", marginTop: "2.2rem" }}
                onClick={() => handleFetchApi("filterBySelectedAccounts")}
              >
                <i className="cil-sync mr-1" />
                Filtrar
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Advertising />
      <AnswerStatusMsg />
    </>
  );
}
