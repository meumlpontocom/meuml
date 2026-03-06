function validateClassName({ input, hasFocusedOnce, form }) {
  let className = "";
  const hasFocused = hasFocusedOnce.length
    ? hasFocusedOnce.find((id) => id === input) !== undefined
    : false;
  const resolve = (test) => {
    if (test) className = "is-valid";
    else className = "is-invalid";
  };
  if (hasFocused || form[input]) {
    switch (input) {
      case "cpf":
        resolve(form[input].replace(/(_)|(\.)|(-)/g, "").length >= 11);
        break;
      case "zip_code":
        resolve(form[input].replace(/(_)|(-)/g, "").length === 8);
        break;
      case "address":
        resolve(form[input].length >= 3 && form[input].length <= 80);
        break;
      case "address_number":
        resolve(form[input].length >= 1 && form[input].length <= 10);
        break;
      case "address_additional_info":
        resolve(!form[input] || form[input].length <= 80);
        break;
      case "district":
        resolve(form[input].length >= 3 && form[input].length <= 80);
        break;
      default:
        resolve(form[input]);
        break;
    }
    return className;
  }
}

export default validateClassName;
