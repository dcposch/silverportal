import { lightTheme } from "@rainbow-me/rainbowkit";

const bgLight = "#eee";
const rainbowTheme = lightTheme({
  borderRadius: "none",
  fontStack: "system",
  accentColorForeground: bgLight,
});
const { colors, fonts, shadows } = rainbowTheme;
colors.modalBackground = bgLight;
colors.connectButtonBackground = bgLight;
colors.profileAction = bgLight;
fonts.body = "system-ui";
shadows.connectButton = "";

export default rainbowTheme;
