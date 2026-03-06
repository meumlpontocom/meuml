import React from "react";
import styled from "styled-components";
import { CListGroupItem } from "@coreui/react";

const StyledCListGroupItem = styled(CListGroupItem)`
  display: flex;
  padding: 0.25rem 0.5rem;
  border-left: 4px solid #ebedef;
  border-radius: 0.25rem;
  .plan-name {
    color: #3c4b64;
    align-self: center;
    font-weight: bold;
    margin-right: 4px;
    background-color: #ebedef;
    border-radius: 0.25rem;
    padding: 0.1rem 0.5rem;
  }
`;

const FreePlanAccounts = ({ accounts }) => {
  return (
    <div className="list-group">
      <StyledCListGroupItem>
        <span className="plan-name">Gratuito</span>
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

export default FreePlanAccounts;
