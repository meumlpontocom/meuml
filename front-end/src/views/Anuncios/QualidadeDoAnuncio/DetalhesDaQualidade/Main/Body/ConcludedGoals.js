import React from "react";
import Card from "reactstrap/lib/Card";

export default function ConcludedGoals({ applicableGoals }) {
  return (
    <div>
      <h5 className="text-primary mb-2">Objetivos concluídos:</h5>
      <div>
        {applicableGoals.length &&
          applicableGoals
            .filter((goal) => goal.progress === 1)
            .map((goal, index) => {
              return (
                <Card
                  className="info border-success p-2"
                  key={index}
                  id={goal.id}
                >
                  <p className="mb-0">
                    <i className="cil-check mr-2 text-success" />{" "}
                    {goal.description}
                  </p>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
