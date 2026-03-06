export default ({ documentType }) => {
  let inputList = [
    {
      col: { xs: 12, sm: 12, md: 6 },
      id: "client_name",
      icon: "user",
      type: "text",
      label: "Nome",
      name: "client_name",
      placeholder: "Nome",
    },
    {
      col: { xs: 12, sm: 12, md: 6 },
      id: "email",
      icon: "at",
      type: "email",
      label: "Email",
      name: "email",
      placeholder: "Ex.: contato@meuml.com",
    },
    {
      col: { xs: 12, sm: 12, md: 6 },
      id: "cpf",
      icon: "contact",
      type: "text",
      label: documentType.toUpperCase(),
      name: "cpf",
      placeholder: "Digite somente números",
      mask: documentType === "cpf" ? "999.999.999-99" : "99.999.999/9999-99",
    },
    {
      col: { xs: 12, sm: 12, md: 6 },
      id: "zip_code",
      icon: "caret-right",
      type: "text",
      label: "CEP",
      name: "zip_code",
      placeholder: "Digite apenas números",
      mask: "99999-999",
    },
    {
      col: { xs: 12, sm: 12, md: 8 },
      id: "address",
      icon: "house",
      type: "text",
      label: "Endereço",
      name: "address",
      placeholder: "Ex: rua xxx ",
    },
    {
      col: { xs: 6, sm: 6, md: 4 },
      type: "text",
      label: "Número residencial",
      name: "address_number",
      id: "address_number",
      placeholder: "Número residencial",
      icon: "location-pin",
    },
    {
      col: { xs: 6, sm: 6, md: 6 },
      type: "text",
      label: "Complemento de endereço",
      name: "address_additional_info",
      id: "address_additional_info",
      placeholder: "Ex: ap 01 bl 02",
      icon: "building",
    },
    {
      col: { xs: 12, sm: 6, md: 6 },
      type: "text",
      label: "Bairro",
      name: "district",
      id: "district",
      placeholder: "Bairro",
      icon: "caret-right",
    }
  ];

  const inscricaoEstadualInput = {
    col: { xs: 12, sm: 6, md: 6 },
    id: "inscricao_municipal",
    icon: "caret-right",
    type: "text",
    label: "Inscrição Municipal",
    name: "inscricao_municipal",
    placeholder: "Digite apenas números",
  };
  if (documentType === "cnpj") inputList.push(inscricaoEstadualInput);
  return [...inputList];
};
