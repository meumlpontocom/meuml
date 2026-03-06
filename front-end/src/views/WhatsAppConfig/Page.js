import React, { useContext, useEffect, useState } from "react";
import {
  // CButton,
  CCard,
  CCardFooter,
  // CCol,
  // CContainer,
  // CModal,
  // CModalBody,
  // CModalFooter,
  // CModalHeader,
  CRow
} from "@coreui/react";
import PageHeader
  from "src/components/PageHeader";
import AddPhoneNumber
  from "./AddPhoneNumber";
import { context } from "./context";
import TopicsList from "./TopicsList";
import LoadPageHandler
  from "src/components/Loading";
import Button from "./Button";
import Card from "./Card";
import SavedPhoneNumbers
  from "./SavedPhoneNumbers";
import { FaCheckCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { confirmPhoneNumber, getPhoneNumbers, getWhatsAppTopics, insertNewPhoneNumber } from "./requests";
import AlertContactList
  from "./AlertContactList";

const Page = () => {
  const {
    setWhatsAppTopics,
    countryCode,
    ddd,
    phoneNumber,
    selectedTopics,
    setRegisteredPhoneNumbers,
    refreshSavedPhoneNumbersData,
    registeredPhoneNumbers
  } = useContext(context);

  const [isLoading, setIsLoading] = useState(false);

  async function handleSave() {
    const payload = {
      country_code: countryCode,
      area_code: ddd || null,
      phone_number: phoneNumber,
      topics: selectedTopics,
    };
    if (selectedTopics?.length) {
      if (countryCode && ddd && phoneNumber) {
        setIsLoading(true);
        const insertNewPhoneResponse = await insertNewPhoneNumber(payload);
        if (insertNewPhoneResponse?.data?.status === "success") {
          const userInput = await Swal.fire({
            type: "success",
            input: "text",
            title: "Código de confirmação",
            text: insertNewPhoneResponse.data.message,
          });

          if (userInput.value) {
            const confirmPhoneResponse = await confirmPhoneNumber({
              phoneId: insertNewPhoneResponse?.data?.data?.id,
              confirmationCode: userInput.value,
            });
            if (confirmPhoneResponse?.data?.status === "success") {
              await refreshSavedPhoneNumbersData();
            } else {
              toast(confirmPhoneResponse.data?.message, {
                type: toast.TYPE.ERROR,
                autoClose: 15 * 1000,
              });
            }
          }
        } else {
          Swal.fire({
            title: "Atenção!",
            type: "warning",
            html: `<p>Se você recebeu o código mas está vendo esta mensagem:</p>
                   <p>
                    <ul class="text-left">
                      <li>Recarregue a página</li>
                      <li>Clique no <span class="text-danger">número</span> de telefone que encontra-se <span class="text-danger">na lista</span></li>
                      <li>Selecione a opção <strong>DIGITAR CÓDIGO</strong></li>
                    </ul>
                   </p>
                   <p>Caso não tenha recebido o código de confirmação em até 5 minutos, tente cadastrar novamente.</p>
                  `,
            showCloseButton: false,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: "Fechar",
          });
        }
      } else {
        await Swal.fire({
          title: "Atenção!",
          type: "warning",
          text: "Você deve informar ao menos um telefone válido.",
        });
      }
    } else {
      await Swal.fire({
        title: "Atenção!",
        type: "warning",
        text: "Você deve selecionar ao menos uma opção válida.",
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    async function getAndSetRegisteredPhoneNumbers() {
      setIsLoading(true);
      const { data } = await getPhoneNumbers();
      setRegisteredPhoneNumbers(data.data);
      setIsLoading(false);
    }

    async function getAndSetWhatsAppTopics() {
      setIsLoading(true);
      const { data } = await getWhatsAppTopics();
      setWhatsAppTopics(data.data);
      setIsLoading(false);
    }

    getAndSetRegisteredPhoneNumbers();
    getAndSetWhatsAppTopics();
  }, [setWhatsAppTopics, setRegisteredPhoneNumbers]);

  return (
    <LoadPageHandler
      isLoading={isLoading}
      render={
        <>
          <PageHeader heading="Configurar Integração WhatsApp" />
          <CRow>
            <AlertContactList />
            <Card headerTitle="OPÇÕES">
              <TopicsList />
            </Card>
            <Card headerTitle="NÚMEROS">
              {!registeredPhoneNumbers?.length ? (
                <>
                  <h5 className="card-text text-primary">Novo</h5>
                  <h6 className="card-text">Informe o número telefone associado com a sua conta no WhatsApp:</h6>
                  <AddPhoneNumber />
                </>
              ) : <></>}
              <SavedPhoneNumbers />
            </Card>
          </CRow>
          {phoneNumber && (
            <CCard className="animated fadeIn">
              <CCardFooter className="d-flex justify-content-end">
                <Button color="success" onClick={handleSave}>
                  Salvar
                  <FaCheckCircle className="ml-2" />
                </Button>
              </CCardFooter>
            </CCard>
          )}
        </>
      }
    />
  );
};

export default Page;

