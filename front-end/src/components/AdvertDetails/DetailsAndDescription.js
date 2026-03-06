import React from "react";
import { Col, Row } from "reactstrap";
import TipsBadge from "./TipsBadge";

export default function DetailsAndDescription() {
  return (
    <Col
      sm="12"
      md="12"
      lg="12"
      xs="12"
      style={{ color: "gray", marginTop: "2.3em" }}
    >
      <h4 style={{ color: "#9D9D9D", marginBottom: "1.7em" }}>
        <i className="cil-caret-right mr-1" />
        <span>{"Descrição & Detalhes".toUpperCase()}</span>
      </h4>
      <Row>
        <Col sm="12" md="6" lg="6" xs="12">
          <div className="list-group list-group-accent">
            <TipsBadge>
              As posições são capturadas durante a madrugada, indicando o
              posicionamento do dia anterior. Por isso, para saber a posição de
              hoje será necessário conferir amanhã.
            </TipsBadge>
            <TipsBadge>
              As posições se referem à colocação do anúncio dentro da categoria
              no qual está cadastrado. Elas não são referentes a nenhuma
              palavra-chave na pesquisa, e sim somente referente à categoria.
            </TipsBadge>
            <TipsBadge>
              Exemplo: se a posição for 128, significa que o anúncio é 128º
              colocado na categoria. Portanto, quanto menor for este número,
              melhor para o seu anúncio.
            </TipsBadge>
          </div>
        </Col>
        <Col sm="12" md="6" lg="6" xs="12">
          <div className="list-group list-group-accent">
            <TipsBadge>
              O sistema captura somente até a posição 1000. Todos os anúncios
              que estiverem em uma posição maior que 1000, serão mostrados como
              1000. Só será mostrada a posição exata de anúncios que estejam em
              posição abaixo de 1000.
            </TipsBadge>
            <TipsBadge>
              Anúncios Inativos (pausados/finalizados) não possuem
              posicionamento, por isso não aparecerá pontos no gráfico para
              anúncios nessa condição.
            </TipsBadge>
          </div>
        </Col>
      </Row>
    </Col>
  );
}
