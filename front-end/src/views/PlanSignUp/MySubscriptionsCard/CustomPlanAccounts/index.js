import React from "react";
import styled from "styled-components";
import { CListGroupItem } from "@coreui/react";

const StyledCListGroupItem = styled(CListGroupItem)`
  display: flex;
  padding: 0.25rem 0.5rem;
  border-left: 4px solid #ebedef;
  border-radius: 0.25rem;
  .plan-name {
    align-self: center;
    font-weight: bold;
    margin-right: 4px;
    background-color: hsla(246, 75%, 49%, 0.1);
    border-radius: 0.25rem;
    padding: 0.1rem 0.5rem;
  }
`;

const CustomPlanAccounts = ({ accounts }) => {
  return (
    <div className="list-group">
      <StyledCListGroupItem>
        <span className="plan-name">Personalizado</span>
        {accounts.length !== 0 ? (
          accounts.map((subscription, index) => {
            return (
              <span key={index}>
                <small>
                  {subscription.accounts}
                  {index + 1 !== accounts.length ? ", " : null}
                </small>
              </span>
            );
          })
        ) : (
          <span>
            <small>Você não possui contas nesta modalidade</small>
          </span>
        )}
      </StyledCListGroupItem>
    </div>
  );
};

export default CustomPlanAccounts;
