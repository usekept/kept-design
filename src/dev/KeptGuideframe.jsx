import { GuideframeGrid } from "@guideframe/react"

// Dev-only layout overlay (Cmd/Ctrl + G), set to the Kept page grid:
// 8 columns, 40px gaps (48px from 48rem), 24px page padding (48px from 48rem),
// and a 1480px grid centered inside that padding.
export default function KeptGuideframe() {
  return (
    <GuideframeGrid
      rulers
      defaultVisible={false}
      columns={8}
      gutter={{ mobile: 40, tablet: 48, desktop: 48 }}
      margin={{ mobile: 24, tablet: 48, desktop: 48 }}
      maxWidth={1480 + 48 * 2}
      breakpoints={{ tablet: 768, desktop: 1024 }}
    />
  )
}
