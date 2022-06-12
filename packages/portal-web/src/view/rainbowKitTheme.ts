import { lightTheme } from "@rainbow-me/rainbowkit";

const bgLight = "#eee";
const rainbowTheme = lightTheme({
  borderRadius: "none",
  fontStack: "system",
  accentColorForeground: bgLight,
});
const { colors } = rainbowTheme;
colors.modalBackground = bgLight;
colors.connectButtonBackground = bgLight;
colors.profileAction = bgLight;

export default rainbowTheme;
