import type { Draft, Template } from "@/lib/types";
import { BGM_OPTIONS, SFX_OPTIONS } from "@/lib/ai/bgm-options";
import { getFontLicense } from "@/lib/ai/fonts";

export type LicenseResourceKind = "음악" | "효과음" | "폰트";

export interface LicenseResourceInfo {
  kind: LicenseResourceKind;
  name: string;
  license: "상업용 가능" | "개인용만";
  source: string;
  licenseDetail: string;
}

export const LICENSE_WARNING_TEXT =
  "⚠️ 이 리소스는 개인용으로만 사용 가능합니다. 상업적 게시 전 대체 리소스로 교체해주세요.";

export function getDraftLicenseSummary(draft?: Draft, template?: Template): LicenseResourceInfo[] {
  const items: LicenseResourceInfo[] = [];

  if (draft?.bgmId) {
    const bgm = BGM_OPTIONS.find((b) => b.id === draft.bgmId);
    if (bgm) {
      items.push({
        kind: "음악",
        name: bgm.name,
        license: bgm.license,
        source: bgm.source,
        licenseDetail: bgm.licenseDetail,
      });
    }
  }

  if (draft?.sfxId) {
    const sfx = SFX_OPTIONS.find((s) => s.id === draft.sfxId);
    if (sfx) {
      items.push({
        kind: "효과음",
        name: sfx.name,
        license: sfx.license,
        source: sfx.source,
        licenseDetail: sfx.licenseDetail,
      });
    }
  }

  if (template?.fontStyle) {
    const font = getFontLicense(template.fontStyle);
    if (font) {
      items.push({
        kind: "폰트",
        name: font.family,
        license: font.license,
        source: font.source,
        licenseDetail: font.licenseDetail,
      });
    }
  }

  return items;
}
