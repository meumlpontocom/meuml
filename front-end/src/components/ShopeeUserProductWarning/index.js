import { CCard } from "@coreui/react";
import { IoIosWarning } from "react-icons/io";

const ShopeeUserProductWarning = () => {
  return (
    <CCard style={{ border: "2px solid #ffe900", backgroundColor: "#fffee0", padding: "10px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <IoIosWarning size={45} color="#ffbe00" /> <span style={{ fontSize: "23px" }}> ATENÇÃO! </span>
      </div>
      <div style={{ fontSize: "17px" }}>
        <p style={{ fontSize: "17px" }}>
          Sobre a replicação para contas do Mercado Livre com <b>User Product</b> (ou{" "}
          <b>Preço por Variação</b>): Agora é possível replicar seus anúncios da Shopee para contas do Mercado
          Livre que possuam o User Product ativo! É importante, porém, se atentar para algumas diferenas:
        </p>

        <ul style={{ fontSize: "17px" }}>
          <li>
            Quando a replicação for para uma conta com User Product, o anuncio que possui variações vai ser
            "multiplicado", ou seja, para cada combinação de variação que o anuncio tem, um novo anuncio será
            criado. Por exemplo, se um anuncio de camiseta possui variação de 2 cores e 2 tamanhos, então ela
            possui 4 combinações de variações possíveis. Se a conta destino da replicação tiver o User Product
            ativo, serão criados 4 novos anuncios, um para cada combinação de variação. Se a conta destino não
            tiver o User Product, será criado somente um anúncio.
          </li>

          <li>
            Conforme descrito no ponto anterior, um único anúncio original pode gerar vários anúncios
            replicados. Nesses casos, o valor da replicação será cobrado para cada anúncio novo criado. No
            exemplo anterior, se uma replicação gerar 4 novos anúncios, serão cobradas 4 replicações, logo 4 x
            R$ 0,25 = R$ 1,00.
          </li>

          <li>
            Caso o anúncio original (da Shopee) possua atributos que não existam no Mercado Livre, esses
            atributos serão ignorados na replicação, e serão mantidos apenas os atributos que possuírem uma
            propriedade equivalente no Mercado Livre.
          </li>
        </ul>
      </div>
    </CCard>
  );
};

export default ShopeeUserProductWarning;
