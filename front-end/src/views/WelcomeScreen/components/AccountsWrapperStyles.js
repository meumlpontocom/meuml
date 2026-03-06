import styled from "styled-components";

const AccountsWrapperStyles = styled.div`
  @media (max-width: 768px) {
    span {
      font-size: 10px;
    }
  }
  @media (max-width: 380px) {
    span.account-plan {
      display: none;
    }
  }
`;

export default AccountsWrapperStyles;
