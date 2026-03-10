import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { Mail, X } from "lucide-react";
import { ContactType } from "../../../hooks/useContactModal";

type ContactModalProps = {
  contactType: ContactType;
  contactMessage: string;
  onClose: () => void;
  onContactTypeChange: (value: ContactType) => void;
  onContactMessageChange: (value: string) => void;
  onSend: () => void;
};

const ContactModal = ({
  contactType,
  contactMessage,
  onClose,
  onContactTypeChange,
  onContactMessageChange,
  onSend,
}: ContactModalProps) => {
  return (
    <ModalWrap>
      <ModalBackdrop onClick={onClose} />
      <ContactModalCard>
        <ContactModalHeader>
          <ContactModalTitleRow>
            <Mail size={18} />
            <ContactModalTitle>문의 보내기</ContactModalTitle>
          </ContactModalTitleRow>
          <CloseButton onClick={onClose} aria-label="문의 모달 닫기">
            <X size={16} />
          </CloseButton>
        </ContactModalHeader>
        <ContactModalBody>
          <ContactField>
            <ContactLabel>유형</ContactLabel>
            <ContactSelect
              value={contactType}
              onChange={(e) =>
                onContactTypeChange(e.target.value as ContactType)
              }
            >
              <option value="오류">오류</option>
              <option value="피드백">피드백</option>
              <option value="기능요청">기능요청</option>
            </ContactSelect>
          </ContactField>
          <ContactField>
            <ContactLabel>내용</ContactLabel>
            <ContactTextarea
              value={contactMessage}
              onChange={(e) => onContactMessageChange(e.target.value)}
              placeholder="오류의 경우, 어떤 상황에서 발생했는지 최대한 자세히 작성해주세요."
            />
          </ContactField>
          <ContactGuide>
            입력하신 내용은 개발자 이메일로 전송됩니다.
          </ContactGuide>
          <ContactActions>
            <CancelButton onClick={onClose}>취소</CancelButton>
            <SendButton onClick={onSend} disabled={!contactMessage.trim()}>
              이메일 보내기
            </SendButton>
          </ContactActions>
        </ContactModalBody>
      </ContactModalCard>
    </ModalWrap>
  );
};

const overlayIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const modalIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const ModalWrap = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const ModalBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  animation: ${overlayIn} 0.2s ease;
`;

const ContactModalCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.3);
  animation: ${modalIn} 0.24s ease;
`;

const ContactModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
`;

const ContactModalTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
`;

const ContactModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
`;

const ContactModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const ContactField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ContactLabel = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: #475569;
`;

const ContactSelect = styled.select`
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #334155;
  background: #ffffff;
  outline: none;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px #c7d2fe;
  }
`;

const ContactTextarea = styled.textarea`
  min-height: 140px;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  color: #334155;
  outline: none;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px #c7d2fe;
  }
`;

const ContactGuide = styled.p`
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
  line-height: 1.4;
`;

const ContactActions = styled.div`
  display: flex;
  gap: 10px;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: #64748b;

  &:hover {
    background: #f8fafc;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  border: 0;
  border-radius: 16px;
  padding: 14px 24px;
  background: #f1f5f9;
  color: #475569;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e2e8f0;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SendButton = styled.button`
  flex: 1;
  border: 0;
  border-radius: 16px;
  padding: 14px 24px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.2);

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background: #bfdbfe;
    box-shadow: none;
    cursor: not-allowed;
  }
`;

export default ContactModal;
