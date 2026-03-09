/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import pptxgen from "pptxgenjs";
import {
  Download,
  Settings,
  Type,
  Layout,
  Palette,
  Trash2,
  Plus,
  Monitor,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Music,
  MessageSquare,
  AlertTriangle,
  Mail,
  X,
} from "lucide-react";
import { FONTS } from "./constants/font";
import { TitlePosition } from "./types/title";
import PositionButton from "./components/PositionButton";

const getTitleOverlayStyle = (
  position: TitlePosition,
  color: string,
  fontSize: number,
  fontFamily: string,
): React.CSSProperties => {
  const style: React.CSSProperties = {
    position: "absolute",
    padding: "24px",
    width: "33.333%",
    zIndex: 10,
    color,
    fontSize: `${fontSize * 0.8}px`,
    fontWeight: 700,
    fontFamily,
  };

  style[position.includes("T") ? "top" : "bottom"] = 0;

  if (position.includes("L")) {
    style.left = 0;
    style.textAlign = "left";
  } else if (position.includes("R")) {
    style.right = 0;
    style.textAlign = "right";
  } else {
    style.left = "50%";
    style.transform = "translateX(-50%)";
    style.textAlign = "center";
  }

  return style;
};

export default function App() {
  const [lyrics, setLyrics] = useState("");
  const [splitMode, setSplitMode] = useState<"block" | "fixed">("block");
  const [linesPerSlide, setLinesPerSlide] = useState(2);
  const [bgColor, setBgColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [showTitle, setShowTitle] = useState(false);
  const [titleText, setTitleText] = useState("");
  const [titlePosition, setTitlePosition] = useState<TitlePosition>("TL");
  const [pptTitle, setPptTitle] = useState("");
  const [fontSize, setFontSize] = useState(36);
  const [titleFontSize, setTitleFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("Noto Sans KR");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [logoError, setLogoError] = useState(false);
  const [hasRuntimeError, setHasRuntimeError] = useState(false);
  const [contactType, setContactType] = useState<
    "오류" | "피드백" | "기능요청"
  >("오류");
  const [contactMessage, setContactMessage] = useState("");

  const selectedFont =
    FONTS.find((font) => font.name === fontFamily)?.value || fontFamily;

  const slides = useMemo(() => {
    if (!lyrics.trim()) return [];

    if (splitMode === "block") {
      const blocks = lyrics.split(/\n\s*\n/);
      return blocks
        .map((block) => block.split("\n").filter((line) => line.trim() !== ""))
        .filter((lines) => lines.length > 0);
    }

    const lines = lyrics.split("\n").filter((line) => line.trim() !== "");
    const result = [];
    for (let i = 0; i < lines.length; i += linesPerSlide) {
      result.push(lines.slice(i, i + linesPerSlide));
    }
    return result;
  }, [lyrics, splitMode, linesPerSlide]);

  useEffect(() => {
    if (slides.length === 0) {
      setCurrentSlideIndex(0);
    } else if (currentSlideIndex >= slides.length) {
      setCurrentSlideIndex(slides.length - 1);
    }
  }, [slides.length, currentSlideIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  useEffect(() => {
    const handleRuntimeError = () => {
      setHasRuntimeError(true);
    };

    window.addEventListener("error", handleRuntimeError);
    window.addEventListener("unhandledrejection", handleRuntimeError);

    return () => {
      window.removeEventListener("error", handleRuntimeError);
      window.removeEventListener("unhandledrejection", handleRuntimeError);
    };
  }, []);

  const handleDownload = async () => {
    const today = new Date();
    const yyyymmdd = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    const firstLyricLine =
      lyrics
        .split("\n")
        .map((line) => line.trim())
        .find((line) => line.length > 0) || "lyrics";
    const baseName = pptTitle.trim() || `${firstLyricLine}_${yyyymmdd}`;
    const safeBaseName = baseName
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";

    slides.forEach((slideLines) => {
      const slide = pres.addSlide();
      slide.background = { color: bgColor.replace("#", "") };

      if (showTitle && titleText) {
        let x: string | number = 0.5;
        let y: string | number = 0.3;
        let align: "left" | "center" | "right" = "left";

        switch (titlePosition) {
          case "TL":
            x = 0.5;
            y = 0.3;
            align = "left";
            break;
          case "TC":
            x = "50%";
            y = 0.3;
            align = "center";
            break;
          case "TR":
            x = 6.5;
            y = 0.3;
            align = "right";
            break;
          case "BL":
            x = 0.5;
            y = 5.0;
            align = "left";
            break;
          case "BC":
            x = "50%";
            y = 5.0;
            align = "center";
            break;
          case "BR":
            x = 6.5;
            y = 5.0;
            align = "right";
            break;
        }

        slide.addText(titleText, {
          x: x as never,
          y: y as never,
          w: "30%",
          fontSize: titleFontSize,
          color: textColor.replace("#", ""),
          align,
          bold: true,
          fontFace: fontFamily,
        });
      }

      slide.addText(slideLines.join("\n"), {
        x: 0,
        y: 0,
        w: "100%",
        h: "100%",
        fontSize,
        color: textColor.replace("#", ""),
        align: "center",
        valign: "middle",
        fontFace: fontFamily,
        lineSpacing: Math.round(fontSize * 1.25),
      });
    });

    pres.writeFile({ fileName: `${safeBaseName || "lyrics"}.pptx` });
  };

  const handleOpenContactModal = () => {
    setContactType(hasRuntimeError ? "오류" : "피드백");
    setContactMessage("");
    setShowContactModal(true);
  };

  const handleSendContactEmail = () => {
    const trimmedMessage = contactMessage.trim();
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

  return (
    <AppShell>
      <Sidebar>
        <Header>
          <BrandRow>
            <LogoWrap>
              {!logoError ? (
                <LogoImage
                  src="/lyricslide_logo.png"
                  alt="LyricSlide Logo"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Music size={30} color="#4f46e5" style={{ opacity: 0.5 }} />
              )}
            </LogoWrap>
            <BrandText>
              <BrandTitle>LyricSlide</BrandTitle>
              <BrandSubtitle>가사를 PPT 슬라이드로</BrandSubtitle>
            </BrandText>
          </BrandRow>
          {lyrics && (
            <ClearButton onClick={() => setShowClearConfirm(true)}>
              <Trash2 size={16} /> 비우기
            </ClearButton>
          )}
        </Header>

        <InputSection>
          <InputHeader>
            <InputLabel>가사 입력</InputLabel>
            <TipBox>
              <TipText>
                <span style={{ fontSize: "20px", lineHeight: 1 }}>💡</span>
                <span>
                  팁: 빈 줄(엔터 두 번)을 입력하면 슬라이드가 구분됩니다.
                </span>
              </TipText>
            </TipBox>
          </InputHeader>
          <LyricsTextarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="여기에 가사를 입력하세요.&#10;&#10;[예시]&#10;학교 종이 땡땡땡&#10;어서 모이자&#10;&#10;선생님이 우리를&#10;기다리신다&#10;&#10;(빈 줄을 두 번 입력하면 다음 슬라이드로 넘어갑니다)"
          />
        </InputSection>
      </Sidebar>

      <MainArea>
        <PreviewSection>
          <PreviewInner>
            <PreviewTopBar>
              <PptTitleInput
                type="text"
                value={pptTitle}
                onChange={(e) => setPptTitle(e.target.value)}
                placeholder="PPT 제목 입력 (비우면 첫 줄 + 날짜로 저장)"
              />
              <DownloadButton
                onClick={() => {
                  void handleDownload();
                }}
                disabled={!lyrics.trim()}
              >
                <Download size={20} /> PPT 다운로드
              </DownloadButton>
              <ContactButton
                onClick={handleOpenContactModal}
                type="button"
                $warning={hasRuntimeError}
              >
                {hasRuntimeError ? (
                  <AlertTriangle size={18} />
                ) : (
                  <MessageSquare size={18} />
                )}
                문의하기
              </ContactButton>
            </PreviewTopBar>
            <PreviewHeader>
              <PreviewTitle>
                <Monitor size={16} /> 슬라이드 미리보기 ({slides.length})
              </PreviewTitle>
              {slides.length > 0 && (
                <PreviewControls>
                  <ArrowGroup>
                    <IconButton
                      onClick={() =>
                        setCurrentSlideIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentSlideIndex === 0}
                    >
                      <ChevronLeft size={20} />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        setCurrentSlideIndex((prev) =>
                          Math.min(slides.length - 1, prev + 1),
                        )
                      }
                      disabled={currentSlideIndex >= slides.length - 1}
                    >
                      <ChevronRight size={20} />
                    </IconButton>
                  </ArrowGroup>
                </PreviewControls>
              )}
            </PreviewHeader>

            <PreviewViewport>
              {slides.length === 0 ? (
                <EmptyPreview>
                  <EmptyIconWrap>
                    <Plus size={32} />
                  </EmptyIconWrap>
                  <EmptyText>
                    가사를 입력하면
                    <br />
                    미리보기가 표시됩니다.
                  </EmptyText>
                </EmptyPreview>
              ) : (
                <SlideOuter>
                  <SlideFrame style={{ backgroundColor: bgColor }}>
                    <SlideBadge>Slide {currentSlideIndex + 1}</SlideBadge>

                    {showTitle && titleText && (
                      <div
                        style={getTitleOverlayStyle(
                          titlePosition,
                          textColor,
                          titleFontSize,
                          selectedFont,
                        )}
                      >
                        {titleText}
                      </div>
                    )}

                    <SlideContent>
                      <SlideLyrics
                        style={{
                          color: textColor,
                          fontSize: `${fontSize * 0.8}px`,
                          fontFamily: selectedFont,
                        }}
                      >
                        {slides[currentSlideIndex]?.join("\n")}
                      </SlideLyrics>
                    </SlideContent>
                  </SlideFrame>
                </SlideOuter>
              )}
            </PreviewViewport>
            {slides.length > 0 && (
              <PreviewFooter>
                <DotIndicators>
                  {slides.map((_, index) => (
                    <SlideDot
                      key={`slide-dot-${index}`}
                      onClick={() => setCurrentSlideIndex(index)}
                      $active={currentSlideIndex === index}
                      aria-label={`${index + 1}번 슬라이드로 이동`}
                    />
                  ))}
                </DotIndicators>
              </PreviewFooter>
            )}
          </PreviewInner>
        </PreviewSection>

        <SettingsSection $open={isSettingsOpen}>
          <SettingsHeader onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
            <SettingsHeading>
              <Settings
                size={16}
                style={{
                  color: "#94a3b8",
                  transform: isSettingsOpen ? "rotate(90deg)" : "rotate(0deg)",
                  transition: "transform 0.5s ease",
                }}
              />
              <span>상세 설정</span>
            </SettingsHeading>
            <SettingsRight>
              {!isSettingsOpen && (
                <CompactHint>
                  <CompactHintItem>
                    <Palette size={12} /> 디자인
                  </CompactHintItem>
                  <CompactHintItem>
                    <Type size={12} /> 제목
                  </CompactHintItem>
                  <CompactHintItem>
                    <Layout size={12} /> 레이아웃
                  </CompactHintItem>
                </CompactHint>
              )}
              {isSettingsOpen ? (
                <ChevronDown size={20} color="#94a3b8" />
              ) : (
                <ChevronUp size={20} color="#94a3b8" />
              )}
            </SettingsRight>
          </SettingsHeader>

          <SettingsBody $open={isSettingsOpen}>
            <SettingsGrid>
              <SettingsColumn>
                <section>
                  <SectionLabel>
                    <Palette size={16} /> 디자인 설정
                  </SectionLabel>

                  <ColorGrid>
                    <ColorField>
                      <FieldTitle>배경색</FieldTitle>
                      <ColorInputWrap>
                        <ColorInput
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                        />
                        <ColorCode>{bgColor}</ColorCode>
                      </ColorInputWrap>
                    </ColorField>
                    <ColorField>
                      <FieldTitle>글자색</FieldTitle>
                      <ColorInputWrap>
                        <ColorInput
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                        />
                        <ColorCode>{textColor}</ColorCode>
                      </ColorInputWrap>
                    </ColorField>
                  </ColorGrid>

                  <FieldGroup>
                    <FieldTitleWithIcon>
                      <Type size={14} /> 폰트 설정
                    </FieldTitleWithIcon>
                    <FontSelect
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                    >
                      {FONTS.map((font) => (
                        <option
                          key={font.name}
                          value={font.name}
                          style={{ fontFamily: font.value }}
                        >
                          {font.name}
                        </option>
                      ))}
                    </FontSelect>
                  </FieldGroup>
                </section>

                <section>
                  <SectionTop>
                    <SectionLabel>
                      <Type size={16} /> 제목 설정
                    </SectionLabel>
                    <Switch
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTitle(!showTitle);
                      }}
                      $active={showTitle}
                    >
                      <SwitchThumb $active={showTitle} />
                    </Switch>
                  </SectionTop>

                  {showTitle && (
                    <FadeInBlock>
                      <Stack gap={16}>
                        <TextInput
                          type="text"
                          placeholder="슬라이드 제목 입력..."
                          value={titleText}
                          onChange={(e) => setTitleText(e.target.value)}
                        />
                        <PositionGrid>
                          <PositionButton
                            pos="TL"
                            label="왼쪽 위"
                            titlePosition={titlePosition}
                            onClick={() => setTitlePosition("TL")}
                          />
                          <PositionButton
                            pos="TC"
                            label="가운데 위"
                            titlePosition={titlePosition}
                            onClick={() => setTitlePosition("TC")}
                          />
                          <PositionButton
                            pos="TR"
                            label="오른쪽 위"
                            titlePosition={titlePosition}
                            onClick={() => setTitlePosition("TR")}
                          />
                          <PositionButton
                            pos="BL"
                            label="왼쪽 아래"
                            titlePosition={titlePosition}
                            onClick={() => setTitlePosition("BL")}
                          />
                          <PositionButton
                            pos="BC"
                            label="가운데 아래"
                            titlePosition={titlePosition}
                            onClick={() => setTitlePosition("BC")}
                          />
                          <PositionButton
                            pos="BR"
                            label="오른쪽 아래"
                            titlePosition={titlePosition}
                            onClick={() => setTitlePosition("BR")}
                          />
                        </PositionGrid>

                        <RangeBlock>
                          <RangeLabelRow>
                            <RowWithBadge>
                              <span>제목 크기</span>
                              <Badge>추천: 18px</Badge>
                            </RowWithBadge>
                            <Value>{titleFontSize}px</Value>
                          </RangeLabelRow>
                          <RangeInput
                            type="range"
                            min="8"
                            max="100"
                            step="1"
                            value={titleFontSize}
                            onChange={(e) =>
                              setTitleFontSize(parseInt(e.target.value, 10))
                            }
                          />
                        </RangeBlock>
                      </Stack>
                    </FadeInBlock>
                  )}
                </section>
              </SettingsColumn>

              <SettingsColumn>
                <section>
                  <SectionLabel>
                    <Settings size={16} /> 레이아웃 및 내보내기
                  </SectionLabel>

                  <Stack gap={20}>
                    <SegmentWrap>
                      <SegmentButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSplitMode("block");
                        }}
                        $active={splitMode === "block"}
                      >
                        빈 줄 기준 분할
                      </SegmentButton>
                      <SegmentButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSplitMode("fixed");
                        }}
                        $active={splitMode === "fixed"}
                      >
                        고정 줄 수 분할
                      </SegmentButton>
                    </SegmentWrap>

                    {splitMode === "fixed" && (
                      <RangeBlock>
                        <RangeLabelRow>
                          <span>슬라이드 당 줄 수</span>
                          <Value>{linesPerSlide}</Value>
                        </RangeLabelRow>
                        <RangeInput
                          type="range"
                          min="1"
                          max="8"
                          step="1"
                          value={linesPerSlide}
                          onChange={(e) =>
                            setLinesPerSlide(parseInt(e.target.value, 10))
                          }
                        />
                      </RangeBlock>
                    )}

                    <RangeBlock>
                      <RangeLabelRow>
                        <RowWithBadge>
                          <span>가사 글자 크기</span>
                          <Badge>추천: 34~36px</Badge>
                        </RowWithBadge>
                        <Value>{fontSize}px</Value>
                      </RangeLabelRow>
                      <RangeInput
                        type="range"
                        min="20"
                        max="120"
                        step="1"
                        value={fontSize}
                        onChange={(e) =>
                          setFontSize(parseInt(e.target.value, 10))
                        }
                      />
                    </RangeBlock>
                  </Stack>
                </section>
              </SettingsColumn>
            </SettingsGrid>
          </SettingsBody>
        </SettingsSection>
      </MainArea>

      {showClearConfirm && (
        <ModalWrap>
          <ModalBackdrop onClick={() => setShowClearConfirm(false)} />
          <ModalCard>
            <ModalTopLine />
            <ModalContent>
              <ModalIconWrap>
                <Trash2 size={32} color="#ef4444" />
              </ModalIconWrap>
              <ModalTitle>가사를 비우시겠습니까?</ModalTitle>
              <ModalDescription>
                입력하신 모든 가사가 삭제됩니다.
                <br />이 작업은 되돌릴 수 없습니다.
              </ModalDescription>
              <ModalButtons>
                <CancelButton onClick={() => setShowClearConfirm(false)}>
                  취소
                </CancelButton>
                <DeleteButton
                  onClick={() => {
                    setLyrics("");
                    setShowClearConfirm(false);
                  }}
                >
                  삭제하기
                </DeleteButton>
              </ModalButtons>
            </ModalContent>
          </ModalCard>
        </ModalWrap>
      )}

      {showContactModal && (
        <ModalWrap>
          <ModalBackdrop onClick={() => setShowContactModal(false)} />
          <ContactModalCard>
            <ContactModalHeader>
              <ContactModalTitleRow>
                <Mail size={18} />
                <ContactModalTitle>문의 보내기</ContactModalTitle>
              </ContactModalTitleRow>
              <CloseButton
                onClick={() => setShowContactModal(false)}
                aria-label="문의 모달 닫기"
              >
                <X size={16} />
              </CloseButton>
            </ContactModalHeader>
            <ContactModalBody>
              <ContactField>
                <ContactLabel>유형</ContactLabel>
                <ContactSelect
                  value={contactType}
                  onChange={(e) =>
                    setContactType(
                      e.target.value as "오류" | "피드백" | "기능요청",
                    )
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
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="오류의 경우, 어떤 상황에서 발생했는지 최대한 자세히 작성해주세요."
                />
              </ContactField>
              <ContactGuide>
                입력하신 내용은 개발자 이메일로 전송됩니다.
              </ContactGuide>
              <ContactActions>
                <CancelButton onClick={() => setShowContactModal(false)}>
                  취소
                </CancelButton>
                <SendButton
                  onClick={handleSendContactEmail}
                  disabled={!contactMessage.trim()}
                >
                  이메일 보내기
                </SendButton>
              </ContactActions>
            </ContactModalBody>
          </ContactModalCard>
        </ModalWrap>
      )}
    </AppShell>
  );
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

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

const AppShell = styled.div`
  height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  color: #0f172a;
  overflow: hidden;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Sidebar = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
  z-index: 20;

  @media (min-width: 768px) {
    width: 485px;
  }
`;

const Header = styled.header`
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(248, 250, 252, 0.5);
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LogoWrap = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
`;

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scale(1.25);
`;

const BrandText = styled.div`
  display: flex;
  flex-direction: column;
`;

const BrandTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  line-height: 1;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: #1e293b;
`;

const BrandSubtitle = styled.span`
  margin-top: 4px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
`;

const ClearButton = styled.button`
  border: 0;
  background: transparent;
  color: #ef4444;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:hover {
    color: #dc2626;
  }
`;

const InputSection = styled.div`
  flex: 1;
  min-height: 0;
  padding: 24px;
  display: flex;
  flex-direction: column;
`;

const InputHeader = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.18em;
`;

const TipBox = styled.div`
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.06);
`;

const TipText = styled.p`
  margin: 0;
  color: #4338ca;
  font-weight: 700;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const LyricsTextarea = styled.textarea`
  flex: 1;
  width: 100%;
  min-height: 0;
  resize: none;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #f8fafc;
  color: #334155;
  padding: 24px;
  font-size: 18px;
  line-height: 1.6;
  font-weight: 500;
  outline: none;
  box-shadow: inset 0 2px 6px rgba(15, 23, 42, 0.06);
  transition: all 0.2s ease;

  &::placeholder {
    font-size: 14px;
    font-weight: 400;
    color: #94a3b8;
  }

  &:focus {
    background: #ffffff;
    border-color: #6366f1;
    box-shadow: 0 0 0 2px #818cf8;
  }
`;

const MainArea = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #f1f5f9;
`;

const PreviewSection = styled.div`
  flex: 2;
  min-height: 0;
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 24px;
  }
`;

const PreviewInner = styled.div`
  width: 100%;
  max-width: 896px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-shrink: 0;
`;

const PreviewTopBar = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PptTitleInput = styled.input`
  flex: 1;
  min-width: 0;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 14px;
  color: #334155;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px #818cf8;
  }
`;

const PreviewTitle = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PreviewControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ArrowGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  padding: 8px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: background 0.2s ease;

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background: #f8fafc;
  }
`;

const PreviewViewport = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  border-radius: 24px;
  background: rgba(148, 163, 184, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 16px;

  @media (min-width: 768px) {
    padding: 32px;
  }
`;

const PreviewFooter = styled.div`
  margin-top: 12px;
  min-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DotIndicators = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SlideDot = styled.button<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? "10px" : "8px")};
  height: ${({ $active }) => ($active ? "10px" : "8px")};
  border-radius: 9999px;
  border: 0;
  padding: 0;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "#7c3aed" : "#cbd5e1")};
  transition: all 0.18s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#6d28d9" : "#94a3b8")};
  }
`;

const EmptyPreview = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
`;

const EmptyIconWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
`;

const SlideOuter = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SlideFrame = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 16 / 9;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.25);
`;

const SlideBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.7);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
`;

const SlideContent = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
`;

const SlideLyrics = styled.div`
  white-space: pre-line;
  line-height: 1.5;
`;

const SettingsSection = styled.div<{ $open: boolean }>`
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -4px 30px rgba(15, 23, 42, 0.05);
  transition: all 0.3s ease;
  flex: ${({ $open }) => ($open ? "2" : "none")};
  min-height: ${({ $open }) => ($open ? "300px" : "56px")};
  height: ${({ $open }) => ($open ? "auto" : "56px")};
`;

const SettingsHeader = styled.div`
  padding: 16px 32px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease;

  &:hover {
    background: #f8fafc;
  }
`;

const SettingsHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-size: 14px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.18em;
  }
`;

const SettingsRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CompactHint = styled.div`
  display: none;
  align-items: center;
  gap: 24px;
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.15em;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const CompactHintItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SettingsBody = styled.div<{ $open: boolean }>`
  overflow-y: auto;
  transition: opacity 0.3s ease;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
  padding: ${({ $open }) => ($open ? "32px" : "0")};
  height: ${({ $open }) => ($open ? "auto" : "0")};
`;

const SettingsGrid = styled.div`
  max-width: 896px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const SettingsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const SectionLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.18em;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 16px;
`;

const ColorField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldTitle = styled.span`
  font-size: 14px;
  color: #64748b;
  font-weight: 700;
`;

const FieldTitleWithIcon = styled(FieldTitle)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.18em;
`;

const ColorInputWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 8px;
`;

const ColorInput = styled.input`
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

const ColorCode = styled.span`
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  color: #475569;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FontSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px #818cf8;
  }
`;

const SectionTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const Switch = styled.button<{ $active: boolean }>`
  width: 44px;
  height: 24px;
  border: 0;
  border-radius: 9999px;
  background: ${({ $active }) => ($active ? "#4f46e5" : "#cbd5e1")};
  display: flex;
  align-items: center;
  padding: 0;
  cursor: pointer;
`;

const SwitchThumb = styled.span<{ $active: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: #ffffff;
  transform: ${({ $active }) =>
    $active ? "translateX(24px)" : "translateX(4px)"};
  transition: transform 0.2s ease;
`;

const Stack = styled.div<{ gap?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap = 12 }) => `${gap}px`};
`;

const TextInput = styled.input`
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  outline: none;

  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px #818cf8;
  }
`;

const PositionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const RangeBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RangeLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
`;

const RowWithBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Badge = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #047857;
  background: #d1fae5;
  border-radius: 6px;
  padding: 2px 6px;
`;

const Value = styled.span`
  color: #4f46e5;
`;

const RangeInput = styled.input`
  width: 100%;
  height: 8px;
  cursor: pointer;
  accent-color: #4f46e5;
`;

const SegmentWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  border-radius: 12px;
  padding: 6px;
`;

const SegmentButton = styled.button<{ $active: boolean }>`
  flex: 1;
  border: 0;
  border-radius: 10px;
  padding: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
  color: ${({ $active }) => ($active ? "#4f46e5" : "#64748b")};
  box-shadow: ${({ $active }) =>
    $active ? "0 2px 10px rgba(15, 23, 42, 0.1)" : "none"};

  &:hover {
    color: ${({ $active }) => ($active ? "#4f46e5" : "#334155")};
  }
`;

const DownloadButton = styled.button`
  width: 220px;
  border: 0;
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #4f46e5;
  color: #ffffff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 14px 28px rgba(79, 70, 229, 0.22);

  &:hover:not(:disabled) {
    background: #4338ca;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    background: #e2e8f0;
    box-shadow: none;
    cursor: not-allowed;
  }

  @media (max-width: 767px) {
    width: 100%;
  }
`;

const ContactButton = styled.button<{ $warning: boolean }>`
  border: 1px solid ${({ $warning }) => ($warning ? "#fca5a5" : "#cbd5e1")};
  border-radius: 12px;
  padding: 11px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ $warning }) => ($warning ? "#fff1f2" : "#ffffff")};
  color: ${({ $warning }) => ($warning ? "#dc2626" : "#334155")};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $warning }) => ($warning ? "#ffe4e6" : "#f8fafc")};
  }

  @media (max-width: 767px) {
    width: 100%;
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

const FadeInBlock = styled.div`
  animation: ${fadeIn} 0.2s ease;
`;

const ModalBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  animation: ${overlayIn} 0.2s ease;
`;

const ModalCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 384px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.3);
  overflow: hidden;
  animation: ${modalIn} 0.24s ease;
`;

const ModalTopLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 8px;
  background: #ef4444;
`;

const ModalContent = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ModalIconWrap = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h3`
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
`;

const ModalDescription = styled.p`
  margin: 0 0 32px;
  color: #64748b;
  font-weight: 500;
`;

const ModalButtons = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
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

const DeleteButton = styled.button`
  flex: 1;
  border: 0;
  border-radius: 16px;
  padding: 14px 24px;
  background: #ef4444;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 10px 24px rgba(239, 68, 68, 0.25);

  &:hover {
    background: #dc2626;
  }

  &:active {
    transform: scale(0.98);
  }
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
