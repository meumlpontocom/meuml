export default function getAppropriateSavedClientData({ userSavedData, documentType }) {
  if (userSavedData.length >= 1) return userSavedData[0];
  else if (!userSavedData.length) return false;

  if (documentType === "cpf") {
    const correctData = userSavedData.reduce(function (previous, current) {
      if (
        current.cpf_cnpj.length === 11 ||
        (current.cpf_cnpj.length === 14 && !current.cpf_cnpj.search("/"))
      ) {
        return current;
      }
      return previous;
    }, {});

    return correctData;
  } else {
    const correctData = userSavedData.reduce(function (previous, current) {
      if (
        (current.cpf_cnpj.length === 14 && current.cpf_cnpj.search("/")) ||
        current.cpf_cnpj.length === 18
      ) {
        return current;
      }
      return previous;
    }, {});

    return correctData;
  }
}
