import React, { useContext, useEffect, useRef } from "react";
import { CInputGroup }                          from "@coreui/react";
import PhoneInput                               from "react-phone-input-2";
import pt                                       from "react-phone-input-2/lang/pt.json";
import styled                                   from "styled-components";
import { context }                              from "src/views/WhatsAppConfig/context";
import "react-phone-input-2/lib/bootstrap.css";

const PhoneConfig = () => {
  const {
    countryCode,
    setCountryCode,
    dddList,
    setDDDList,
    ddd,
    setDDD,
    phoneNumber,
    setPhoneNumber,
  } = useContext(context);

  const dddSelectRef = useRef();

  useEffect(() => {
    setPhoneNumber("");
    if (countryCode !== "55") {
      dddSelectRef.current.hidden = true;
    } else {
      dddSelectRef.current.hidden = false;
      dddSelectRef.current.focus();
    }
  }, [countryCode, setPhoneNumber]);

  useEffect(() => {
    async function getDDDList() {
      const res = await fetch(
        "https://gist.githubusercontent.com/ThadeuLuz/797b60972f74f3080b32642eb36481a5/raw/ae593b4c0702c95fd854d23e66582b022914d3d5/dddsBrasileiros.json",
      );
      const data = await res.json();
      setDDDList(Object.keys(data.estadoPorDdd));
    }

    getDDDList();
  }, [setDDDList]);

  return (
    <InputsContainer>
      <CountrySelect>
        <PhoneInput
          id="country-select"
          style={{ fontFamily: "inherit" }}
          country={"BR"}
          localization={pt}
          enableAreaCodes={false}
          placeholder=""
          value={countryCode}
          onChange={(code) => setCountryCode(code)}
          countryCodeEditable={false}
          jumpCursorToEnd={false}
          enableSearch
          searchPlaceholder="Buscar"
          searchNotFound="Nenhum resultado"
          inputProps={{
            maxLength: 3,
            autoFocus: false,
            disabled: true,
          }}
        />
      </CountrySelect>
      <DDDSelect countrycode={countryCode}>
        <select
          ref={dddSelectRef}
          className="custom-select"
          name=""
          title=""
          defaultValue="0"
          onChange={(e) => setDDD(e.target.value)}
        >
          <option value="0" disabled>
            DDD
          </option>
          {Object.values(dddList).map((ddd) => (
            <option key={ddd}>{ddd}</option>
          ))}
        </select>
      </DDDSelect>

      <PhoneNumberInput>
        <PhoneInput
          disabled={countryCode === "55" && !ddd}
          localization={pt}
          style={{ fontFamily: "inherit" }}
          placeholder="Digite apenas números"
          disableCountryCode={true}
          enableAreaCodes={false}
          enableTerritories={false}
          disableInitialCountryGuess={true}
          disableCountryGuess={true}
          value={phoneNumber}
          onChange={(phone) => setPhoneNumber(phone)}
        />
      </PhoneNumberInput>
    </InputsContainer>
  );
};

const CountrySelect = styled.div`
  input {
    border: 1px solid #d8dbe0 !important;

    :focus {
      border-color: #958bef !important;
      box-shadow: 0 0 0 0.2rem rgb(50 31 219 / 25%) !important;
    }
  }

  input[type="tel"] {
    width: 130px !important;
    color: #768192;
  }

  input[disabled] {
    cursor: default;
  }

  .search {
    padding: 16px !important;
    box-shadow: 0 1px 1px 0 rgb(60 75 100 / 14%),
    0 2px 1px -1px rgb(60 75 100 / 12%), 0 1px 3px 0 rgb(60 75 100 / 20%);
  }

  .search-box {
    width: 95% !important;
    font-size: 16px !important;
    padding: 8px 12px !important;
  }

  .country-list {
    max-height: 320px !important;

    li {
      cursor: pointer !important;
    }
  }

  .react-tel-input .flag-dropdown,
  .react-tel-input .selected-flag {
    width: 60px;
  }

  .react-tel-input .selected-flag:focus:before,
  .react-tel-input .selected-flag.open:before {
    border-color: #958bef !important;
    box-shadow: 0 0 0 0.2rem rgb(50 31 219 / 25%);
    width: 60px;
  }
`;

const InputsContainer = styled.div`
  display: flex;
`;

const DDDSelect = styled(CInputGroup)`
  display: ${(props) => (props.countrycode === "55" ? "" : "none")};
  max-width: 80px;
  min-width: 75px;

  select {
    font-size: 16px;
    min-height: 39px;
  }
`;

const PhoneNumberInput = styled.div`

input {
    max-width: 220px !important;
    color: #768192;

    &:disabled {
      background-color: #d8dbe083;
    }
  }

  .react-tel-input .form-control {
    padding: 18.5px 14px;
    border: 1px solid #d8dbe0;
  }

  .react-tel-input .form-control:focus {
    border-color: #958bef !important;
    box-shadow: 0 0 0 0.2rem rgb(50 31 219 / 25%);
  }

  .react-tel-input .flag-dropdown {
    display: none !important;
  }
`;

export default PhoneConfig;
