import styled from "styled-components";

export const HashInputSimpleContainer = styled.div`
    width: 100%;
    display: flex;
    border-radius: 0.25rem;
    
    > input {
        border: none;
        padding: 0.5rem 1rem;
        font-size: 1.09rem;
        color: #5c6873;
        flex: 1;
        z-index: 3;
        border-radius: 0.25rem 0 0 0.25rem;
        border: 1px solid #e4e7ea;
    } 

    > input:focus {
        outline: 0;
        box-shadow: 0 0 0 0.2rem rgba(60, 75, 100, 0.25);
        transition: .3s;
        border-color: #8ad4ee;
        border-radius: 0.25rem;
    }

    > span {
        border-radius: 0 0.25rem 0.25rem 0;
        width: 40px;
        background-color: #F0F3F5;
        color: #5c6873;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid #e4e7ea;
    }
`;