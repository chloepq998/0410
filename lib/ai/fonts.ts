export interface FontOption {
  fontStyle: string;
  family: string;
  source: string;
  license: "상업용 가능" | "개인용만";
  licenseDetail: string;
}

// 템플릿의 fontStyle 표시 문구와 실제 글꼴/출처/라이선스를 매핑한다.
// 모두 SIL Open Font License(OFL) 기반의 한글 웹폰트로, 출처 표기 없이 상업적 사용이 가능하다.
export const FONT_OPTIONS: FontOption[] = [
  {
    fontStyle: "손글씨 느낌 세리프",
    family: "Gaegu",
    source: "Google Fonts",
    license: "상업용 가능",
    licenseDetail: "SIL Open Font License 1.1 — 출처 표기 없이 수정·재배포·상업적 사용이 가능합니다.",
  },
  {
    fontStyle: "둥근 산세리프",
    family: "Jua",
    source: "Google Fonts",
    license: "상업용 가능",
    licenseDetail: "SIL Open Font License 1.1 — 출처 표기 없이 수정·재배포·상업적 사용이 가능합니다.",
  },
  {
    fontStyle: "미니멀 산세리프",
    family: "Noto Sans KR",
    source: "Google Fonts",
    license: "상업용 가능",
    licenseDetail: "SIL Open Font License 1.1 — 출처 표기 없이 수정·재배포·상업적 사용이 가능합니다.",
  },
  {
    fontStyle: "굵은 고딕",
    family: "Black Han Sans",
    source: "Google Fonts",
    license: "상업용 가능",
    licenseDetail: "SIL Open Font License 1.1 — 출처 표기 없이 수정·재배포·상업적 사용이 가능합니다.",
  },
  {
    fontStyle: "감성 세리프",
    family: "Noto Serif KR",
    source: "Google Fonts",
    license: "상업용 가능",
    licenseDetail: "SIL Open Font License 1.1 — 출처 표기 없이 수정·재배포·상업적 사용이 가능합니다.",
  },
  {
    fontStyle: "키치 팝",
    family: "Do Hyeon",
    source: "Google Fonts",
    license: "상업용 가능",
    licenseDetail: "SIL Open Font License 1.1 — 출처 표기 없이 수정·재배포·상업적 사용이 가능합니다.",
  },
  {
    fontStyle: "깔끔한 산세리프",
    family: "Pretendard",
    source: "Pretendard (오픈소스 프로젝트)",
    license: "상업용 가능",
    licenseDetail: "SIL Open Font License 1.1 — 출처 표기 없이 수정·재배포·상업적 사용이 가능합니다.",
  },
];

export function getFontLicense(fontStyle: string): FontOption | undefined {
  return FONT_OPTIONS.find((f) => f.fontStyle === fontStyle);
}
