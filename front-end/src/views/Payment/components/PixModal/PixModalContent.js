function PixModalContent() {
  const url = localStorage.getItem("@MeuML-PaymentURL");
  return (
    <p>
      Para abrir a fatura, utilize o botão abaixo ou{" "}
      <a href={url} target="_blank" rel="noreferrer">
        clique aqui
      </a>
    </p>
  );
}

export default PixModalContent;
