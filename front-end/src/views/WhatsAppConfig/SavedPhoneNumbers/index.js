import React, { useCallback, useContext, useEffect, useState } from "react";
import { context }                                             from "src/views/WhatsAppConfig/context";
import { getToken }                                            from "src/services/auth";
import { CCard, CCardBody, CCardFooter, CCollapse, CRow }      from "@coreui/react";
import Heading                                                 from "./Heading";
import LoadingContainer                                        from "./LoadingContainer";
import Phone                                                   from "./Phone";
import PhoneStatus                                             from "./PhoneStatus";
import SelectedTopics                                          from "./SelectedTopics";
import ResendConfirmationBtn                                   from "./ResendConfirmationBtn";
import DeletePhoneBtn                                          from "./DeletePhoneBtn";
import NoPhoneRegisteredTip                                    from "./NoPhoneRegisteredTip";
import InformConfirmationBtn                                   from "./InformConfirmationBtn";
import { DropDown }                                            from "src/components/buttons/ButtonGroup";
import { FaCog }                                               from "react-icons/fa";

function SavedPhoneNumbers() {
  const { registeredPhoneNumbers } = useContext(context);
  const [toggleCollapse, setToggleCollapse] = useState({});
  const [loadingCard, setLoadingCard] = useState({
    cardId: null,
    cardClassName: null,
  });
  
  const startLoadingCard = (cardId, cardClassName = "border-primary") =>
    setLoadingCard({ cardId, cardClassName });
  const stopLoadingCard = () =>
    setLoadingCard({ cardId: null, cardClassName: "border-primary" });

  useEffect(() => {
    setToggleCollapse(() => {
      let phoneIdList = {};
      registeredPhoneNumbers.length &&
        registeredPhoneNumbers.forEach(
          (phone) => (phoneIdList[phone.id] = false)
        );
      return phoneIdList;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleToggleCollapseClick(id) {
    setToggleCollapse((currentIdList) => {
      return { ...currentIdList, [id]: !currentIdList[id] };
    });
  }

  function createHeaders() {
    return { headers: { Authorization: `Bearer ${getToken()}` } };
  }

  const isCardCollapsed = useCallback(
    (phoneId) => {
      return toggleCollapse ? toggleCollapse[phoneId] : false;
    },
    [toggleCollapse]
  );

  return (
    <section id="registered-phones">
      <Heading />
      <CRow>
        {registeredPhoneNumbers.length ? (
          registeredPhoneNumbers.map((phone) => {
            return (
              <LoadingContainer
                isLoading={loadingCard.cardId === phone.id}
                cardClassName={loadingCard.cardClassName}
              >
                <CCard
                  className={`${
                    phone.is_confirmed ? "text-info" : "text-danger"
                  } border-secondary pointer`}
                >
                  <CCardBody>
                    <CRow onClick={() => handleToggleCollapseClick(phone.id)}>
                      <Phone
                        countryCode={phone.country_code}
                        areaCode={phone.area_code}
                        phoneNumber={phone.phone_number}
                        isCardCollapsed={isCardCollapsed(phone.id)}
                      />
                      <PhoneStatus isConfirmed={phone.is_confirmed} />
                    </CRow>
                  </CCardBody>
                  <CCollapse
                    key={phone.id}
                    show={isCardCollapsed(phone.id)}
                    className="text-dark"
                  >
                    <SelectedTopics selectedTopics={phone.topics} />
                    <CCardFooter className="text-right">
                      {!phone.is_confirmed && (
                        <DropDown
                          title={
                            <>
                              <FaCog className="mr-2" />
                              <span>Opções</span>
                            </>
                          }
                          color="warning"
                          direction="bottom"
                          caret
                        >
                          <InformConfirmationBtn phoneId={phone.id} />
                          <ResendConfirmationBtn
                            phoneId={phone.id}
                            requestHeaders={createHeaders()}
                            startLoadingCard={startLoadingCard}
                            stopLoadingCard={stopLoadingCard}
                          />
                        </DropDown>
                      )}
                      <DeletePhoneBtn
                        phoneId={phone.id}
                        requestHeaders={createHeaders()}
                        startLoadingCard={startLoadingCard}
                        stopLoadingCard={stopLoadingCard}
                      />
                    </CCardFooter>
                  </CCollapse>
                </CCard>
              </LoadingContainer>
            );
          })
        ) : (
          <NoPhoneRegisteredTip />
        )}
      </CRow>
    </section>
  );
}

export default SavedPhoneNumbers;
