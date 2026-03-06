import React       from "react";
import { FaRuler } from "react-icons/fa";

const CardHeader = () => {
  return (
    <>
      <h3>
        <FaRuler />&nbsp;
        Atributos obrigatórios
      </h3>
      <h6 className="text-muted">da Tabela de medidas</h6>
    </>
  );
};

export default CardHeader;
