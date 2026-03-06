import React, { useContext, useMemo, useState, useEffect } from "react";
import PlanContext from "../../context";
import formatMoney from "../../../../../helpers/formatMoney";
import {
  Card,
  CardBody,
  ListGroup,
  ListGroupItem,
  ListGroupItemText,
  CardHeader,
} from "reactstrap";

export default function OptionPersonal() {
  const { plans, setPlans, accounts } = useContext(PlanContext);
  const prices = useMemo(() => {
    const { account_multiplier } = plans;
    const multiplier = account_multiplier
      .filter((item) => item.accounts === accounts.selecteds.length)
      .map((item) => item.mutiplier);
      
    const price =
      plans.planSelect.toLowerCase() === "personalizado"
        ? plans.selected
            .filter((item) => item.checked)
            .reduce((prevValue, curValue) => 0, 0)
        : plans[plans.planSelect].price;
    let totalPrice = price * multiplier[0];

    if (accounts.selecteds.length > 1 && !totalPrice)
      totalPrice =
        account_multiplier
          .filter((item) => Number(item.accounts, 10) === -1)
          .map((item) => item.mutiplier)[0] * price;

    return {
      total: totalPrice,
      totalFormatted: formatMoney(totalPrice),
      fields: plans.selected.map((item) => {
        const handleFreePrices =
          item.price > 0 ? formatMoney(item.price) : "Grátis";
        return {
          ...item,
          formattedPrice: item.checked
            ? `Incluído (${handleFreePrices})`
            : handleFreePrices,
        };
      }),
    };
  }, [accounts.selecteds.length, plans]);

  function handleChange(e) {
    prices.total = prices.total + e.price;
    
    var newSelected = plans.selected.map((item) =>
      item.id === e.id ? { ...item, checked: !item.checked } : item
    );

    var professionalModules = plans.packages
      .filter((pack) => pack.title == "Profissional")[0]
      .modules
      .split(', ');

    var newPlan = professionalModules
      .every(value => newSelected
                        .filter((item) => item.checked)
                        .map((item)=> item.title )
                      .includes(value)) ? 'Profissional' : 'personalizado';

    setPlans({
      ...plans,
      selected: newSelected,
      planSelect: newPlan,
    });
  }
  
  const [toggle, setToggle] = useState({});
  const handleToggle = (index) => {
    let _toggleStateCopy = { ...toggle };
    for (const iterator in _toggleStateCopy) {
      _toggleStateCopy[iterator] = false;
    }
    setToggle({
      ..._toggleStateCopy,
      [index]: !toggle[index],
    });
  };
  useEffect(() => {
    const addModulesToToggleController = () =>
      prices.fields.map((option, index) =>
        setToggle({ ...toggle, [index]: false })
      );
    addModulesToToggleController();
  }, []);
  return (
    <Card>
      <CardHeader>
        <h4>Selecione os itens de sua assinatura</h4>
      </CardHeader>
      <CardBody style={{ padding: "5px 0px 5px 0px" }}>
        <ListGroup>
          {prices.fields.length > 0 ? (
            prices.fields.map((option, index) => {
              return (
                <>
                  <ListGroupItem
                    key={option.id}
                    className={option.platform}
                    onClick={() => handleToggle(index)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: toggle[index]
                        ? "rgb(237, 237, 237, 1)"
                        : "rgb(237, 237, 237, 0.5)",
                      padding: "0px 10px 0px 10px",
                      borderColor: "#fff",
                      borderWidth: "3px",
                    }}
                  >
                    <ListGroupItemText
                      style={{
                        alignItems: "center",
                        fontSize: "16px",
                        margin: "0px 0px",
                      }}
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        id={option.title + option.id}
                        disabled={option.disabled}
                        checked={option.checked}
                        value={option.id}
                        onChange={(_) => handleChange(option)}
                      />
                      <span style={{ color: "#000" }}>{option.title}</span>
                      <span style={{ color: "#B25252", float: "right" }}>
                        {option.formattedPrice}
                      </span>
                    </ListGroupItemText>
                    {toggle[index] ? (
                      <div
                        style={{
                          margin: "10px",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <small>{plans.modules[index].tools}</small>
                      </div>
                    ) : (
                      <></>
                    )}
                  </ListGroupItem>
                </>
              );
            })
          ) : (
            <></>
          )}
        </ListGroup>
      </CardBody>
    </Card>
  );
}
