export default function validatedClassName({ input, form, hasFocusedOnce }) {
  let className = "";
  const updateClassName = (update) => (className = update);
  const hasFocused = hasFocusedOnce.length
    ? hasFocusedOnce.find((inputName) => inputName === input) !== undefined
    : false;
  if (hasFocused) {
    switch (input) {
      case "creditcard_cpf":
        const cpf = form[input].replace(/(_)|(\.)|(-)/g, "").length >= 11;
        if (cpf) updateClassName("is-valid");
        else updateClassName("is-invalid");
        break;
      case "creditcard_phone":
        const phone = form[input].replace(/(_*)( *)/g, "").length >= 10;
        if (phone) updateClassName("is-valid");
        else updateClassName("is-invalid");
        break;
      case "creditcard_expiration_month":
        const expirationMonth = form[input].replace(/(_*)/g, "").length === 2;
        if (expirationMonth) updateClassName("is-valid");
        else updateClassName("is-invalid");
        break;
      case "creditcard_expiration_year":
        const expirationYear = form[input].replace(/(_*)/g, "").length === 4;
        if (expirationYear) updateClassName("is-valid");
        else updateClassName("is-invalid");
        break;
      case "creditcard_cvv":
        const cvv = form[input].replace(/(_*)/g, "").length === 3;
        if (cvv) updateClassName("is-valid");
        else updateClassName("is-invalid");
        break;

      default:
        if (form[input]) updateClassName("is-valid");
        else updateClassName("is-invalid");
        break;
    }
  }
  return className;
}
