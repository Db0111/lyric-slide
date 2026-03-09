/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FONTS } from "./constants/font";
import { TitlePosition } from "./types/title";
import PositionButton from "./components/PositionButton";

export default function App() {
  const [lyrics, setLyrics] = useState("");
  const [splitMode, setSplitMode] = useState<"block" | "fixed">("block");
  const [linesPerSlide, setLinesPerSlide] = useState(2);
  const [bgColor, setBgColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [showTitle, setShowTitle] = useState(false);
  const [titleText, setTitleText] = useState("");
  const [titlePosition, setTitlePosition] = useState<TitlePosition>("TL");
  const [fontSize, setFontSize] = useState(36);
  const [titleFontSize, setTitleFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState("Noto Sans KR");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const slides = useMemo(() => {
    if (!lyrics.trim()) return [];

    if (splitMode === "block") {
      // Split by one or more empty lines
      const blocks = lyrics.split(/\n\s*\n/);
      return blocks
        .map((block) => block.split("\n").filter((line) => line.trim() !== ""))
        .filter((lines) => lines.length > 0);
    } else {
      const lines = lyrics.split("\n").filter((line) => line.trim() !== "");
      const result = [];
      for (let i = 0; i < lines.length; i += linesPerSlide) {
        result.push(lines.slice(i, i + linesPerSlide));
      }
      return result;
    }
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

  const handleDownload = async () => {
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
          x: x as any,
          y: y as any,
          w: "30%",
          fontSize: titleFontSize,
          color: textColor.replace("#", ""),
          align: align,
          bold: true,
          fontFace: fontFamily,
        });
      }

      const content = slideLines.join("\n");
      slide.addText(content, {
        x: 0,
        y: 0,
        w: "100%",
        h: "100%",
        fontSize: fontSize,
        color: textColor.replace("#", ""),
        align: "center",
        valign: "middle",
        fontFace: fontFamily,
        lineSpacing: Math.round(fontSize * 1.25),
      });
    });

    pres.writeFile({ fileName: `${titleText || "lyrics"}.pptx` });
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 overflow-hidden">
      <div className="w-full md:w-[485px] flex flex-col bg-white border-r border-slate-200 shadow-sm z-20">
        <header className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center overflow-hidden rounded-xl">
              <img
                src="/lyricslide_logo.png"
                alt="LyricSlide Logo"
                className="w-full h-full object-contain scale-125"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/music.svg";
                  e.currentTarget.className =
                    "w-8 h-8 text-indigo-600 opacity-50";
                }}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-medium tracking-tight leading-none text-slate-800">
                LyricSlide
              </h1>
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                가사를 PPT 슬라이드로
              </span>
            </div>
          </div>
          {lyrics && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors font-bold"
            >
              <Trash2 className="w-4 h-4" /> 비우기
            </button>
          )}
        </header>

        <div className="flex-1 p-6 flex flex-col min-h-0">
          <div className="mb-4 space-y-3">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              가사 입력
            </label>
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl shadow-sm">
              <p className="text-base text-indigo-700 font-bold flex items-start gap-2">
                <span className="text-xl leading-none">💡</span>
                <span>
                  팁: 빈 줄(엔터 두 번)을 입력하면 슬라이드가 구분됩니다.
                </span>
              </p>
            </div>
          </div>
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="여기에 가사를 입력하세요.&#10;&#10;[예시]&#10;학교 종이 땡땡땡&#10;어서 모이자&#10;&#10;선생님이 우리를&#10;기다리신다&#10;&#10;(빈 줄을 두 번 입력하면 다음 슬라이드로 넘어갑니다)"
            className="flex-1 w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none font-medium text-slate-700 text-lg placeholder:text-sm placeholder:font-normal leading-relaxed shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-slate-100">
        <div className="flex-[2] flex flex-col p-4 md:p-6 border-b border-slate-200 min-h-0 overflow-hidden">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Monitor className="w-4 h-4" /> 슬라이드 미리보기 (
                {slides.length})
              </h2>
              {slides.length > 0 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-500">
                    {currentSlideIndex + 1} / {slides.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentSlideIndex((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentSlideIndex === 0}
                      className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentSlideIndex((prev) =>
                          Math.min(slides.length - 1, prev + 1),
                        )
                      }
                      disabled={currentSlideIndex >= slides.length - 1}
                      className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 relative min-h-0 w-full flex items-center justify-center bg-slate-200/30 rounded-3xl overflow-hidden p-4 md:p-8">
              {slides.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-lg text-center">
                    가사를 입력하면
                    <br />
                    미리보기가 표시됩니다.
                  </p>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div
                      className="relative w-full max-w-full max-h-full shadow-2xl overflow-hidden rounded-xl border border-slate-300"
                      style={{
                        aspectRatio: "16/9",
                        maxHeight: "100%",
                        maxWidth: "100%",
                      }}
                    >
                      <div
                        key={currentSlideIndex}
                        className="absolute inset-0"
                        style={{ backgroundColor: bgColor }}
                      >
                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white/70 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold z-10 border border-white/10">
                          Slide {currentSlideIndex + 1}
                        </div>

                        {showTitle && titleText && (
                          <div
                            className={`absolute p-6 w-1/3 z-10 ${
                              titlePosition.includes("T") ? "top-0" : "bottom-0"
                            } ${
                              titlePosition.includes("L")
                                ? "left-0 text-left"
                                : titlePosition.includes("R")
                                  ? "right-0 text-right"
                                  : "left-1/2 -translate-x-1/2 text-center"
                            }`}
                            style={{
                              color: textColor,
                              fontSize: `${titleFontSize * 0.8}px`,
                              fontWeight: "bold",
                              fontFamily:
                                FONTS.find((f) => f.name === fontFamily)
                                  ?.value || fontFamily,
                            }}
                          >
                            {titleText}
                          </div>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center p-10 text-center">
                          <div
                            style={{
                              color: textColor,
                              fontSize: `${fontSize * 0.8}px`,
                              whiteSpace: "pre-line",
                              lineHeight: "1.5",
                              fontFamily:
                                FONTS.find((f) => f.name === fontFamily)
                                  ?.value || fontFamily,
                            }}
                          >
                            {slides[currentSlideIndex]?.join("\n")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={`bg-white transition-all duration-300 ease-in-out shadow-[0_-4px_30px_rgba(0,0,0,0.05)] flex flex-col ${isSettingsOpen ? "flex-[2] min-h-[300px]" : "h-14"}`}
        >
          <div
            className="flex items-center justify-between px-8 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors shrink-0"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <div className="flex items-center gap-2">
              <Settings
                className={`w-4 h-4 text-slate-400 transition-transform duration-500 ${isSettingsOpen ? "rotate-90" : "rotate-0"}`}
              />
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                상세 설정
              </span>
            </div>
            <div className="flex items-center gap-4">
              {!isSettingsOpen && (
                <div className="hidden md:flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Palette className="w-3 h-3" /> 디자인
                  </span>
                  <span className="flex items-center gap-1">
                    <Type className="w-3 h-3" /> 제목
                  </span>
                  <span className="flex items-center gap-1">
                    <Layout className="w-3 h-3" /> 레이아웃
                  </span>
                </div>
              )}
              {isSettingsOpen ? (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </div>

          <div
            className={`p-8 overflow-y-auto transition-opacity duration-300 ${isSettingsOpen ? "opacity-100" : "opacity-0 pointer-events-none h-0 p-0"}`}
          >
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Settings Column */}
              <div className="space-y-8">
                <section>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                    <Palette className="w-4 h-4" /> 디자인 설정
                  </label>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="text-sm text-slate-500 font-bold">
                        배경색
                      </span>
                      <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                        />
                        <span className="text-sm font-mono font-bold uppercase text-slate-600">
                          {bgColor}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-sm text-slate-500 font-bold">
                        글자색
                      </span>
                      <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                        />
                        <span className="text-sm font-mono font-bold uppercase text-slate-600">
                          {textColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-slate-500 font-bold">
                      폰트 설정
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {FONTS.map((font) => (
                        <button
                          key={font.name}
                          onClick={() => setFontFamily(font.name)}
                          className={`px-3 py-2 text-xs rounded-xl border transition-all text-left ${
                            fontFamily === font.name
                              ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-bold"
                              : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                          }`}
                          style={{ fontFamily: font.value }}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
                      <Type className="w-4 h-4" /> 제목 설정
                    </label>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowTitle(!showTitle);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${showTitle ? "bg-indigo-600" : "bg-slate-200"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTitle ? "translate-x-6" : "translate-x-1"}`}
                      />
                    </button>
                  </div>

                  {showTitle && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <input
                        type="text"
                        placeholder="슬라이드 제목 입력..."
                        value={titleText}
                        onChange={(e) => setTitleText(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                      />
                      <div className="grid grid-cols-3 gap-2">
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
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>제목 크기</span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">
                              추천: 18px
                            </span>
                          </div>
                          <span className="text-indigo-600">
                            {titleFontSize}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="8"
                          max="100"
                          step="1"
                          value={titleFontSize}
                          onChange={(e) =>
                            setTitleFontSize(parseInt(e.target.value))
                          }
                          className="w-full h-2 accent-indigo-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </motion.div>
                  )}
                </section>
              </div>

              <div className="space-y-8">
                <section className="space-y-6">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest">
                    <Settings className="w-4 h-4" /> 레이아웃 및 내보내기
                  </label>

                  <div className="space-y-5">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSplitMode("block");
                        }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${splitMode === "block" ? "bg-white shadow-md text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        빈 줄 기준 분할
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSplitMode("fixed");
                        }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${splitMode === "fixed" ? "bg-white shadow-md text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        고정 줄 수 분할
                      </button>
                    </div>

                    {splitMode === "fixed" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-slate-500">
                          <span>슬라이드 당 줄 수</span>
                          <span className="text-indigo-600">
                            {linesPerSlide}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="8"
                          step="1"
                          value={linesPerSlide}
                          onChange={(e) =>
                            setLinesPerSlide(parseInt(e.target.value))
                          }
                          className="w-full h-2 accent-indigo-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-bold text-slate-500">
                        <div className="flex items-center gap-2">
                          <span>가사 글자 크기</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">
                            추천: 34~36px
                          </span>
                        </div>
                        <span className="text-indigo-600">{fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="120"
                        step="1"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full h-2 accent-indigo-600 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </section>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  disabled={!lyrics.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95 text-base"
                >
                  <Download className="w-5 h-5" />
                  PPT 다운로드
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                  가사를 비우시겠습니까?
                </h3>
                <p className="text-slate-500 font-medium mb-8">
                  입력하신 모든 가사가 삭제됩니다.
                  <br />이 작업은 되돌릴 수 없습니다.
                </p>
                <div className="flex w-full gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      setLyrics("");
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
