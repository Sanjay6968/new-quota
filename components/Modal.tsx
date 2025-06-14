import React from "react";
import styled from "styled-components";

interface ModalProps {
  title: string;
  message: string;
  buttonText: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, message, buttonText, onClose }) => {
  return (
    <Backdrop>
      <ModalContainer>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <Button onClick={onClose}>{buttonText}</Button>
      </ModalContainer>
    </Backdrop>
  );
};



const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: white; 
  color: black;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  text-align: center;
`;

const ModalMessage = styled.p`
  color: black;
  font-size: 16px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
`;

const Message = styled.p`
  font-size: 1.2rem;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background: #fed700;
  color: #0a121e;
  font-weight: bold;
  font-size: 1.6rem;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
  border-radius: 5px;

  &:hover {
    background: #e0a800;
  }
`;

export default Modal;