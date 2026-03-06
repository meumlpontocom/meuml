import { CCard } from "@coreui/react";
import { IoIosWarning } from "react-icons/io";

const UserProductWarning = () => {
  return (
    <CCard style={{ border: "2px solid #ffe900", backgroundColor: "#fffee0", padding: "10px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <IoIosWarning size={45} color="#ffbe00" /> <span style={{ fontSize: "23px" }}> ATENÇÃO! </span>
      </div>
      <div style={{ fontSize: "17px" }}>
        <p style={{ fontSize: "17px" }}>
          Nos ultimos dias estivemos trabalhando na replicação de anúncios quando ela envolve contas com a
          ferramenta <b>User Product</b> (ou <b> Preço por variação</b>) ativa. Estamos finalizando alguns
          ajustes, mas a replicação já é possível! Queremos trazer, portanto, alguns pontos importantes a
          serem considerados quando uma replicação envolver uma conta com essa ferramenta:
        </p>

        <ul style={{ fontSize: "17px" }}>
          <li>
            {" "}
            Continua <b>NÃO</b> sendo possível replicar um anúncio de uma conta que <b>tem</b> o User Product
            para uma conta que <b>não o tem</b>, mas o contrário é possível;
          </li>
          <li>
            {" "}
            Nesse novo formato, um anuncio que possui variações vai ser "multiplicado", ou seja, para cada
            combinação de variação que o anuncio tem, um novo anuncio será criado. Por exemplo, se um anuncio
            de camiseta possui variação de 2 cores e 2 tamanhos, então ela possui 4 combinações de variações
            possíveis. Se a conta destino da replicação <b>tiver</b> o User Product ativo, serão criados 4
            novos anuncios, um para cada combinação de variação. Se a conta destino <b>não tiver</b> o User
            Product, o novo anuncio será igual ao original.
          </li>

          <li>
            Conforme descrito no ponto anterior, um único anúncio original pode gerar vários anúncios
            replicados. Nesses casos, o valor da replicação será cobrado para cada anúncio novo criado. No
            exemplo anterior, se uma replicação gerar 4 novos anúncios, serão cobradas 4 replicações, logo 4 x
            R$ 0,25 = R$ 1,00.
          </li>
        </ul>
      </div>
    </CCard>
  );
};

export default UserProductWarning;
