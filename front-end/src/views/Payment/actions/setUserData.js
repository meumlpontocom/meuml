import {
  SET_USER_NAME,
  SET_USER_EMAIL,
  SET_USER_CPF_CNPJ,
  SET_USER_INSCRICAO_MUNICIPAL,
  SET_USER_ZIP_CODE,
  SET_USER_ADDRESS_STREET,
  SET_USER_ADDRESS_NUMBER,
  SET_USER_ADDRESS_DISTRICT,
  SET_USER_ADDRESS_COMPLEMENT,
  SET_USER_ADDRESS_CITY,
  SET_USER_ADDRESS_CITY_CODE,
  SET_USER_ADDRESS_PROVINCE
} from "./types";

export const setUserName = (string) => ({
  type: SET_USER_NAME,
  payload: string,
});

export const setUserEmail = (string) => ({
  type: SET_USER_EMAIL,
  payload: string,
});

export const setUserCpfCnpj = (string) => ({
  type: SET_USER_CPF_CNPJ,
  payload: string,
});

export const setUserInscricaoMunicipal = (string) => ({
  type: SET_USER_INSCRICAO_MUNICIPAL,
  payload: string,
});

export const setUserZipCode = (string) => ({
  type: SET_USER_ZIP_CODE,
  payload: string,
});

export const setUserAddressStreet = (string) => ({
  type: SET_USER_ADDRESS_STREET,
  payload: string,
});

export const setUserAddressNumber = (string) => ({
  type: SET_USER_ADDRESS_NUMBER,
  payload: string,
});

export const setUserAddressDistrict = (string) => ({
  type: SET_USER_ADDRESS_DISTRICT,
  payload: string,
});

export const setUserAddressComplement = (string) => ({
  type: SET_USER_ADDRESS_COMPLEMENT,
  payload: string,
});

export const setUserAddressCity = (string) => ({
  type: SET_USER_ADDRESS_CITY,
  payload: string,
});

export const setUserAddressCityCode = (string) => ({
  type: SET_USER_ADDRESS_CITY_CODE,
  payload: string,
});

export const setUserAddressProvince = (string) => ({
  type: SET_USER_ADDRESS_PROVINCE,
  payload: string,
});
