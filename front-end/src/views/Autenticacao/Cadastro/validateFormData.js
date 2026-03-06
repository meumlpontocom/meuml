// Validate account creation form input values before API POST
const validate = ({ username, email, password, confirmPassword }) => {
  if (!username || !email || !password || !confirmPassword) {
    return { status: "warning", message: "Preencha todos os campos!" };
  } else if (password.length < 6) {
    return {
      status: "warning",
      message: "A senha deve conter no mínimo 6 caracteres!",
    };
  } else if (confirmPassword !== password) {
    return { status: "warning", message: "As senhas não conferem!" };
  } else if (email.toLowerCase().match("icloud")) {
    return {
      status: "warning",
      message: "Esse provedor de email não é aceito pela plataforma ",
    };
  } else {
    return { status: "success", message: "OK" };
  }
};

export default validate;
