import React, { useState, createContext } from "react";
import { getPhoneNumbers }                from "./requests";

export const context = createContext();
export const { Provider, Consumer } = context;

export const WhatsAppConfigProvider = ({ children }) => {
  const [registeredPhoneNumbers, setRegisteredPhoneNumbers] = useState([]);
  const [countryCode, setCountryCode] = useState("55");
  const [dddList, setDDDList] = useState({});
  const [ddd, setDDD] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [whatsAppTopics, setWhatsAppTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);

  async function refreshSavedPhoneNumbersData() {
    const refreshRegisteredNumbersDataResponse = await getPhoneNumbers();
    refreshRegisteredNumbersDataResponse?.data?.data &&
      setRegisteredPhoneNumbers(refreshRegisteredNumbersDataResponse.data.data);
  }
  
  return (
    <Provider
      value={{
        refreshSavedPhoneNumbersData,
        registeredPhoneNumbers,
        setRegisteredPhoneNumbers,
        countryCode,
        setCountryCode,
        dddList,
        setDDDList,
        ddd,
        setDDD,
        phoneNumber,
        setPhoneNumber,
        whatsAppTopics,
        setWhatsAppTopics,
        selectedTopics,
        setSelectedTopics,
      }}
    >
      {children}
    </Provider>
  );
};
