import React, { useState } from "react";
import "./index.css";
import { CardBody } from "reactstrap";

export default function Body({ packs, index, id, packageName, subscription }) {
  const Package = ({ index, title, description }) => {
    const [toggle, setToggle] = useState(false);
    return (
      <>
        <li
          key={index}
          onClick={() => setToggle(!toggle)}
          className="list-group-item pointer"
        >
          <span className="module-title">{title}</span>
        </li>
        {toggle ? (
          <div className="card-accent-secondary animated fadeIn">
            <div className="card card-body">{description}</div>
          </div>
        ) : (
          <></>
        )}
      </>
    );
  };
  function PlanDetails({ packs, index }) {
    const _modules = packs[index];
    return _modules.list.map((_module, _index) => {
      if (packageName !== "GRATUITO") {
        return _module.price !== 0 &&
          subscription
            .filter((sub) => sub.id === id)[0]
            ?.modules?.includes(_module.id) ? (
          <Package
            index={_index}
            title={_module.title}
            description={_module.description}
          />
        ) : (
          <></>
        );
      }
      return (
        _module.price === 0 && (
          <Package
            index={_index}
            title={_module.title}
            description={_module.description}
          />
        )
      );
    });
  }
  return (
    <CardBody className="subscription-body">
      <ul className="list-group list-group-flush">
        {packageName.toUpperCase() !== "GRATUITO" ? (
          <li className="list-group-item">
            <span className="module-title">
              Todos os módulos do Plano Gratuito <i className="cil-plus" />
            </span>
          </li>
        ) : (
          <></>
        )}
        <PlanDetails index={index} packs={packs} />
      </ul>
    </CardBody>
  );
}
