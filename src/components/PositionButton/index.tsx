import { TitlePosition } from "@/src/types/title";
import styled from "@emotion/styled";

const Button = styled.button<{ active: boolean }>`
  height: 40px;
  border: 1px solid;
  border-color: ${({ active }) => (active ? "#4f46e5" : "#e2e8f0")};
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
  background: ${({ active }) => (active ? "#4f46e5" : "#ffffff")};
  color: ${({ active }) => (active ? "#ffffff" : "#475569")};
  box-shadow: ${({ active }) =>
    active ? "0 8px 24px rgba(79, 70, 229, 0.2)" : "none"};
  transform: ${({ active }) => (active ? "scale(1.05)" : "scale(1)")};

  &:hover {
    border-color: ${({ active }) => (active ? "#4f46e5" : "#a5b4fc")};
  }
`;

const Dot = styled.div<{
  horizontal: "left" | "center" | "right";
  vertical: "top" | "bottom";
}>`
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: currentColor;

  margin-left: ${({ horizontal }) =>
    horizontal === "left" ? "6px" : horizontal === "right" ? "auto" : "auto"};
  margin-right: ${({ horizontal }) =>
    horizontal === "left" ? "auto" : horizontal === "right" ? "6px" : "auto"};
  margin-top: ${({ vertical }) => (vertical === "top" ? "6px" : "auto")};
  margin-bottom: ${({ vertical }) => (vertical === "top" ? "auto" : "6px")};
`;

const PositionButton = ({
  pos,
  label,
  titlePosition,
  onClick,
}: {
  pos: TitlePosition;
  label: string;
  titlePosition: TitlePosition;
  onClick: () => void;
}) => {
  const horizontal = pos.includes("L")
    ? "left"
    : pos.includes("R")
      ? "right"
      : "center";
  const vertical = pos.includes("T") ? "top" : "bottom";

  return (
    <Button onClick={onClick} title={label} active={titlePosition === pos}>
      <Dot horizontal={horizontal} vertical={vertical} />
    </Button>
  );
};

export default PositionButton;
