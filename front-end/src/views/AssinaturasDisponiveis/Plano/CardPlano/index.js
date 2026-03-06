import React, { useContext, useMemo } from "react";
import { Button, Col, Row } from "reactstrap";
import formatMoney from "../../../../helpers/formatMoney";
import PlanContext from "../context";
import { BoxCard } from "./styles";
import { useDispatch } from "react-redux";
import { requestPayment } from "../../../../redux/actions";
import api from "../../../../services/api";
import decimalFormat from "../../../../helpers/decimalFormat";
import Swal from "sweetalert2";
import { getToken } from "../../../../services/auth";

export default function CardPlano({ title }) {
  const dispatch = useDispatch();
  const { plans, setPlans, history, accounts, setLoading } = useContext(PlanContext);
  const plan = useMemo(() => {
    const { account_multiplier } = plans;
    const multiplier = account_multiplier
      .filter(item => item.accounts === accounts.selecteds.length)
      .map(item => item.mutiplier);

    const { price, array } = plans[title];
    let totalPrice = price * multiplier[0];

    if (accounts.selecteds.length > 1 && !totalPrice)
      totalPrice =
        account_multiplier.filter(item => Number(item.accounts, 10) === -1).map(item => item.mutiplier)[0] *
        price;
    return {
      options: array,
      accountsSelected: accounts.selecteds.length || "0",
      total: totalPrice ? totalPrice : price,
      totalFormatted: formatMoney(totalPrice ? totalPrice : price),
      unitPrice: formatMoney(
        (totalPrice ? totalPrice : price) / (accounts.selecteds.length > 0 ? accounts.selecteds.length : 1),
      ),
      selected: array,
      planSelect: title,
    };
  }, [accounts, plans, title]);
  function handleSelect() {
    const { id } = plans[title];
    window.scrollTo(0, 600);
    setPlans({
      ...plans,
      packageId: id,
      selected: plans.selected.map(item =>
        plan.selected.find(select => item.id === select.id)
          ? { ...item, checked: true, disabled: true }
          : { ...item, checked: false, disabled: false },
      ),
      planSelect: plan.planSelect,
    });
  }
  async function handleBuy() {
    try {
      setLoading(true);
      const formData = new FormData();
      const { id: package_id } = plans[title];
      const selects = accounts.selecteds
        .map(item =>
          accounts.nameId
            .filter(selected => {
              return selected.name === item;
            })
            .map(item => item.id),
        )
        .join(",");
      formData.append("accounts_id", selects);
      formData.append("package_id", package_id);
      formData.append("modules_id", "");
      formData.append("total_price", plan.total);
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
          total: decimalFormat(plan.total, 2),
          orderType: "subscription",
        }),
      );
      history.push("/pagamento");
    } catch (error) {
      Swal.fire({
        title: "Ops!",
        html: `<p>${error.response.data.message}</p>`,
        type: "warning",
        showCloseButton: true,
      });
    } finally {
      setLoading(false);
    }
  }
  const ItemWithDescription = ({ id, title, tools }) => {
    return (
      <Col key={id} xs={12}>
        <h3>{title}</h3>
        <p>{tools}</p>
      </Col>
    );
  };
  return (
    <BoxCard className="mr-4 mb-2">
      <Row className="header-card">
        <Col xs={12}>
          <h2>{title}</h2>
        </Col>
        <Col xs={12}>
          <p>
            Valor total: <b>{plan.totalFormatted}</b>
          </p>
        </Col>
        <Col xs={12}>
          <Row className="price-footer">
            <Col xs={6} style={{ textAlign: "end" }}>
              <small>Valor p/conta: {plan.unitPrice}</small>
            </Col>
            <Col xs={4} className="border-left">
              <small>Contas: {plan.accountsSelected}</small>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="body-card">
        {plan.planSelect !== "Gratuito" ? (
          <Col xs={12}>
            <h3>Todas as funcionalidades do Plano Gratuito, mais:</h3>
          </Col>
        ) : null}
        {plan.options.map(item => {
          if (plan.planSelect !== "Gratuito") {
            return item.price !== 0 ? (
              <ItemWithDescription id={item.id} title={item.title} tools={item.tools} />
            ) : null;
          }
          return <ItemWithDescription id={item.id} title={item.title} tools={item.tools} />;
        })}
      </Row>
      <Row className="header-card">
        <Col xs={6}>
          <Button color="secondary" size="sm" onClick={handleSelect}>
            PERSONALIZE
          </Button>
        </Col>
        <Col xs={6}>
          <Button color="primary" size="sm" onClick={handleBuy}>
            COMPRAR
          </Button>
        </Col>
      </Row>
    </BoxCard>
  );
}
