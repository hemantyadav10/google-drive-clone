export const FOLDER_COLORS = [
  { name: "Yellow", value: "#FFCE3C" },
  { name: "Dark red", value: "#E73E29" },
  { name: "Dark orange", value: "#EE7110" },
  { name: "Dark green", value: "#3F9F4A" },
  { name: "Dark teal", value: "#27938E" },
  { name: "Dark blue", value: "#1E84D0" },
  { name: "Dark purple", value: "#9A61C7" },
  { name: "Dark pink", value: "#CC53B4" },
  { name: "Grey", value: "#B0B7BA" },
  { name: "Light red", value: "#FFBCB2" },
  { name: "Light orange", value: "#FFBF84" },
  { name: "Light green", value: "#8ED290" },
  { name: "Light teal", value: "#7AD1CD" },
  { name: "Light blue", value: "#86C8F7" },
  { name: "Light purple", value: "#D4AFF6" },
  { name: "Light pink", value: "#F7AAE7" },
] as const;

export type FolderColor = (typeof FOLDER_COLORS)[number]["value"];
