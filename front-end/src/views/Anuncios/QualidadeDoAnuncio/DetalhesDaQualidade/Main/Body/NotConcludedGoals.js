import React from "react";
import Card from "reactstrap/lib/Card";
import inputListToValidate from "../../../../EditarAnuncio/Main/inputListToValidate";

export default function NotConcludedGoals({ applicableGoals, history }) {
  const goalIsEditionCapable = (id) =>
    inputListToValidate.filter((inputName) => inputName === id).length;

  const handleClick = () => history.push("/anuncios/editar-anuncio");

  return (
    <div>
      <h5 className="text-primary mb-2">Objetivos não concluídos:</h5>
      <div>
        {applicableGoals.length &&
          applicableGoals
            .filter((goal) => goal.progress === 0)
            .map(({ id, description }, index) => {
              return (
                <Card
                  key={index}
                  id={id}
                  onClick={() => goalIsEditionCapable(id) && handleClick()}
                  style={{
                    cursor: goalIsEditionCapable(id) ? "pointer" : "default",
                  }}
                  className="info border-danger p-2 goal-btn"
                >
                  <p className="mb-0">
                    <i className="cil-x text-danger mr-2" />
                    {description}
                  </p>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
