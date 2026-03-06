import React, { useState, useEffect } from "react";
import Swal                           from "sweetalert2";
import Updates                        from "./Updates";
import { CardGroup }                  from "reactstrap";
import api                            from "../../services/api";
import { getToken }                   from "../../services/auth";

function Home() {
  const [subscriptionExpirationMessage, setSubscriptionExpirationMessage] = useState("");

  useEffect(() => {
    if (subscriptionExpirationMessage) {
      Swal.fire({
        title: "Atenção",
        html: `<p>${subscriptionExpirationMessage}</p>`,
        type: "warning",
        showConfirmButton: true,
        confirmButtonText: "Renovar",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
      }).then((user) => {
        if (user.value) {
          window.location.assign("/#/assinaturas/planos");
        }
      });
    }
  }, [subscriptionExpirationMessage]);

  useEffect(() => {
    async function fetchSubscriptionDetails() {
      function handleError({ error }) {
        if (error.response) {
          Swal.fire({
            title: "Atenção",
            html: `<p>${error.response.message}</p>`,
            type: error.response.status,
            showCloseButton: true,
          });
        } else
          Swal.fire({
            title: "Atenção",
            html: `<p>${error.message ? error.message : error}</p>`,
            type: "error",
            showCloseButton: true,
          });
      }
      try {
        const {
          data: { data },
        } = await api.get("/subscriptions/details", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!getToken().error) {
          data.forEach((subscription) => {
            const { expiration_date } = subscription;
            switch (expiration_date) {
              case "Ilimitado":
                break;

              default:
                let todaysDate = new Date();
                let expirationDate = new Date(expiration_date);
                todaysDate.setHours(0, 0, 0, 0);
                expirationDate.setHours(0, 0, 0, 0);

                const datesAreEntirelyEqual = todaysDate.toJSON() === expirationDate.toJSON();
                const isAlreadyExpired = expirationDate < todaysDate;
                const monthsAreEqual = todaysDate.getMonth() === expirationDate.getMonth();
                const expirationMinusTodays = expirationDate.getDate() - todaysDate.getDate();
                const expiresBetweenOneOrTwoDays = expirationMinusTodays <= 2 && expirationMinusTodays > 0;
                const lastDayOfMonth = new Date(
                  todaysDate.getFullYear(),
                  todaysDate.getMonth() + 1,
                  0
                ).getDate();
                const isLastDayOfMonth = lastDayOfMonth === todaysDate.getDate();

                if (datesAreEntirelyEqual) {
                  setSubscriptionExpirationMessage("Sua assinatura expira hoje!");
                } else if (isAlreadyExpired) {
                  setSubscriptionExpirationMessage("Uma ou mais de suas assinaturas esta vencida!");
                } else if (monthsAreEqual && expiresBetweenOneOrTwoDays) {
                  setSubscriptionExpirationMessage(
                    `Sua assinatura irá finalizar em ${expirationDate.toLocaleDateString("pt-BR")}.`
                  );
                } else if (isLastDayOfMonth && expirationDate.getDate() <= 2) {
                  setSubscriptionExpirationMessage(
                    `Sua assinatura irá finalizar em ${expirationDate.toLocaleDateString("pt-BR")}.`
                  );
                } else break;
            }
          });
        }
      } catch (error) {
        handleError({ error });
      }
    }
    fetchSubscriptionDetails();
    return () => subscriptionExpirationMessage;
  }, [subscriptionExpirationMessage]);

  return (
    <div className="animated fadeIn">
      <CardGroup className="row justify-content-center mt-5">
        <Updates
          className="card-columns"
          color="dark"
          key="1"
          style={{ maxWidth: "22rem" }}
          header={
            <>
              <i className="mb-2 fa fa-cog fa-4x" />
              <h5>Este é o MeuML.com Versão 2!</h5>
            </>
          }
        >
          Nesta nova versão teremos muito mais flexibilidade e agilidade para desenvolver novas ferramentas
          para você, vendedor.
        </Updates>
        <Updates
          className="card-columns"
          color="primary"
          key="2"
          style={{ maxWidth: "22rem" }}
          header={
            <>
              <i className="mb-2 fa fa-check-circle fa-4x" />
              <h5>Novidades</h5>
            </>
          }
        >
          Para começar, aproveite para usar nossas ferramentas gratuitas, que em breve publicaremos novas
          funcionalidades!
        </Updates>
        <Updates
          className="card-columns"
          color="secondary"
          key="3"
          style={{ maxWidth: "22rem" }}
          header={
            <>
              <i className="mb-2 fa fa-users fa-4x" />
              <h5>Multicontas</h5>
            </>
          }
        >
          A versão 2 do MeuML.com continua Multicontas, assim como já era na versão 1. Fique a vontade para
          adicionar quantas contas quiser!
        </Updates>
        <Updates
          className="card-columns"
          color="danger"
          key="4"
          style={{ maxWidth: "22rem" }}
          header={
            <>
              <i className="mb-2 fa fa-balance-scale fa-4x" />
              <h5>Pesos e Dimensões</h5>
            </>
          }
        >
          Acompanhe os pesos e dimensões de todas as categorias do MercadoLivre, de forma gratuita!
        </Updates>
        <Updates
          className="card-columns"
          color="warning"
          key="5"
          style={{ maxWidth: "22rem" }}
          header={
            <>
              <i className="mb-2 fa fa-ban fa-4x" />
              <h5>Bloqueios</h5>
            </>
          }
        >
          Bloqueie compradores indesejados de forma simples e rápida, em várias contas ao mesmo tempo, de
          forma gratuita!
        </Updates>
      </CardGroup>
    </div>
  );
}

export default Home;
