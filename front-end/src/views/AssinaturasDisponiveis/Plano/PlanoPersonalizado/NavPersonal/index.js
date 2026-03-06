import React, { useContext, useMemo } from "react";
import Swal from "sweetalert2";
import PlanContext from "../../context";
import { useDispatch } from "react-redux";
import { Button, Col, Row } from "reactstrap";
import api from "../../../../../services/api";
import { BodyNav, NavContainer } from "./styles";
import { getToken } from "../../../../../services/auth";
import formatMoney from "../../../../../helpers/formatMoney";
import { requestPayment } from "../../../../../redux/actions";
import decimalFormat from "../../../../../helpers/decimalFormat";

export default function NavPersonal() {
  const dispatch = useDispatch();
  const { plans, accounts, setLoading, history } = useContext(PlanContext);

  const prices = useMemo(() => {
    const { account_multiplier } = plans;
    var accountsSP = [];
    var accountsML = [];
    var multiplierSP = { 0: 0 };
    var multiplierML = { 0: 0 };
    accounts.nameId.map(item => {
      accounts.selecteds.map(sele => {
        if (item.name === sele) {
          if (item.platform === "SP") {
            accountsSP.push(item.platform);

            multiplierSP = account_multiplier
              .filter(item => item.accounts === accountsSP.length)
              .map(item => item.mutiplier);
          }

          if (item.platform === "ML") {
            accountsML.push(item.platform);

            multiplierML = account_multiplier
              .filter(item => item.accounts === accountsML.length)
              .map(item => item.mutiplier);
          }
        }
      });
    });

    const multiplier = multiplierSP[0] + multiplierML[0];

    var price;

    switch (plans.planSelect) {
      case "Profissional":
        localStorage.setItem("pro", 1);
        var priceMultiplier = plans.Profissional.price * multiplierML;
        price =
          plans.planSelect === "Profissional"
            ? plans.selected
                .filter(item => item.checked)
                .reduce(
                  (prevValue, curValue) =>
                    curValue.platform === "SP"
                      ? curValue.price * multiplierSP + priceMultiplier
                      : priceMultiplier,
                  0,
                )
            : plans.Profissional.price;

        break;
      case "personalizado":
        price = 0;
        price =
          plans.planSelect === "personalizado"
            ? plans.selected
                .filter(item => item.checked)
                .reduce(
                  (prevValue, curValue) =>
                    curValue.checked === true
                      ? curValue.platform === "SP"
                        ? prevValue + curValue.price * multiplierSP
                        : prevValue + curValue.price * multiplierML[0]
                      : 0,
                  0,
                )
            : plans[plans.planSelect].price;

        break;
      case "Gratuito":
        localStorage.removeItem("pro");
        price =
          plans.planSelect === "Gratuito"
            ? plans.selected
                .filter(item => item.checked)
                .reduce(
                  (prevValue, curValue) =>
                    curValue.checked === true
                      ? curValue.platform === "SP"
                        ? prevValue + curValue.price * multiplierSP
                        : prevValue + curValue.price * multiplierML
                      : 0,
                  0,
                )
            : plans[plans.planSelect].price;

        break;
    }

    price = !!price ? price : 0;
    let totalPrice = price;

    if (accounts.selecteds.length > 1 && !totalPrice)
      totalPrice =
        account_multiplier.filter(item => Number(item.accounts, 10) === -1).map(item => item.mutiplier)[0] *
        price;

    return {
      total: totalPrice,
      accountsSelected: accounts.selecteds.length || "0",
      totalFormatted: formatMoney(totalPrice),
      unitPrice: formatMoney(totalPrice),
      fields: plans.selected
        .filter(item => item.checked)
        .map(item => ({
          ...item,
          formattedPrice: formatMoney(item.price),
        })),
    };
  }, [accounts.selecteds.length, plans]);
  async function handleFetch(formData) {
    try {
      const {
        data: {
          data: { id },
          message,
        },
      } = await api.post("/subscribe", formData, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      Swal.fire({
        title: "Atenção",
        showCloseButton: true,
        html: `<p>${message}</p>`,
        type: "info",
      });
      dispatch(
        requestPayment({
          checkoutId: id,
          total: decimalFormat(prices.total, 2),
          orderType: "subscription",
        }),
      );
      history.push("/pagamento");
    } catch (error) {
      if (error.response) {
        Swal.fire({
          title: "Ops!",
          html: `<p>${error.response.data.message}</p>`,
          type: "warning",
          showCloseButton: true,
        });
        return error.response;
      }
      return error;
    } finally {
      setLoading(false);
    }
  }
  const checkModules = () => {
    const selectedModules = plans.selected.filter(item => item.checked).map(item => item.id);
    const professional = selectedModules.filter(id => id === 6 || id === 7 || id === 8).length;

    const shopee = selectedModules.filter(id => id === 12).length;
    return {
      modules_id: professional === 3 && shopee == 0 ? null : selectedModules.join(","),
      package_id: professional === 3 && shopee == 0 ? 2 : null,
    };
  };

  const handleBuy = () => {
    setLoading(true);
    const { selecteds } = accounts;
    const selectedAccounts = selecteds
      .map(item =>
        accounts.nameId
          .filter(selected => {
            return selected.name === item;
          })
          .map(item => item.id),
      )
      .join(",");
    const { modules_id, package_id } = checkModules();

    const formData = new FormData();
    formData.append("accounts_id", selectedAccounts);
    formData.append("total_price", decimalFormat(prices.total, 2));
    formData.append("package_id", package_id);
    formData.append("modules_id", modules_id);
    return handleFetch(formData);
  };

  return (
    <NavContainer className="mr-2 mb-2">
      <Row className="header-card">
        <Col xs={12}>
          <h2>{plans.planSelect}</h2>
        </Col>
        <Col xs={12}>
          <p className="no-red">
            Valor total: <b>{prices.totalFormatted}</b>
          </p>
        </Col>
        <Col xs={12}>
          <Row className="price-footer">
            <Col xs={6} style={{ textAlign: "end" }}>
              <small>Valor p/conta: {prices.unitPrice}</small>
            </Col>
            <Col xs={4} className="border-left">
              <small>Contas: {prices.accountsSelected}</small>
            </Col>
          </Row>
        </Col>
      </Row>
      <BodyNav>
        <Col xs={12}>
          {prices.fields.map(item => (
            <Row key={item.id} style={{ justifyContent: "space-between" }}>
              <Col xs={8} className="text-left">
                <h3>{item.title}</h3>
              </Col>
              <Col xs={4} className="text-right">
                <h3>{item.formattedPrice === formatMoney(0) ? "Grátis" : item.formattedPrice}</h3>
              </Col>
            </Row>
          ))}
        </Col>
      </BodyNav>
      <Row className="footer-card">
        <Col xs={12}>
          <Button
            disabled={prices.total < 10 ? true : false}
            title={
              prices.total < 10
                ? "O valor mínimo que nossos métodos de pagamento aceitam é R$10,00."
                : "Prosseguir para o pagamento."
            }
            color="primary"
            size="sm"
            onClick={handleBuy}
          >
            COMPRAR
          </Button>
        </Col>
        <Col
          className="animated fadeIn"
          style={{
            color: "#777",
            fontWeight: "lighter",
            justifyContent: "center",
          }}
        >
          {prices.total < 10 && prices.total > 0 ? (
            <small>O valor mínimo que nossos métodos de pagamento aceitam é R$10,00.</small>
          ) : null}
        </Col>
      </Row>
    </NavContainer>
  );
}
