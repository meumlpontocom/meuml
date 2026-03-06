import styled from "styled-components";
import { Container } from "reactstrap";

export const ContainerNews = styled(Container)`
  i {
    font-size: 3rem;
    color: #20a8d8;
  }

  .loading-div {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 50px 0 20px 0;
  }

  .overflow-container {
    max-height: 600px;
    overflow-y: auto;
    padding: 10px 0;

    &::-webkit-scrollbar {
      width: 8px;
      background-color: #f5f5f5;
    }
    &::-webkit-scrollbar-thumb {
      background: linear-gradient(0deg, #20a8d8a8 0%, #20a8d8a8 100%);
      &:hover {
        background: linear-gradient(0deg, #20a8d8 0%, #20a8d8 100%);
      }
      border: 1px solid transparent;
      border-radius: 9px;
      background-clip: content-box;
    }
  }

  .row {
    margin: 0;
    padding: 10px;
    align-items: center;
    background: #cccccc42;
    &.white-bg {
      background: transparent;
    }
    .col-sm-1 {
      min-width: 87px;
    }

    .col-12 {
      text-align: center;
      margin-bottom: 10px;
    }

    .title-news {
      font-weight: bold;
      font-size: 1.1rem;
      color: #495057;
    }

    .sub-news {
      color: #495057;
      font-size: 0.9rem;
    }

    .link-news {
      display: flex;
      justify-content: center;

      > :not(:first-child) {
        margin-left: 5px;
      }

      a {
        text-decoration: underline;
        color: #5aa3e3;
        text-align: center;
        font-weight: 600;
      }
    }
  }
`;
