import { useState } from "react";

export type ContactType = "오류" | "피드백" | "기능요청";

export const useContactModal = () => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactType, setContactType] = useState<ContactType>("오류");
  const [message, setMessage] = useState("");

  const openContactModal = () => {
    setContactType("피드백");
    setMessage("");
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
  };

  const sendContactEmail = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    const subject = `[LyricSlide] ${contactType} 문의`;
    const body = `${trimmedMessage}

---
유형: ${contactType}
페이지: ${window.location.href}
시각: ${new Date().toLocaleString("ko-KR")}
`;

    window.location.href = `mailto:db200111@daum.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShowContactModal(false);
  };

  return {
    showContactModal,
    contactType,
    contactMessage: message,
    openContactModal,
    closeContactModal,
    setContactType,
    setContactMessage: setMessage,
    sendContactEmail,
  };
};
