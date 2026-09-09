// =========================================================================
// 🎯 CERTIFICATE TEMPLATE & COORDINATES CONFIGURATION
// When you provide your official certificate template image, place it in:
// public/assets/certificate_template.png
// The canvas below will automatically draw it as the background and position
// the participant's details at the exact coordinates below.
// Canvas coordinate space: 2000px width × 1414px height (Standard A4 Landscape)
// =========================================================================
export const CERT_CONFIG = {
  templateImageUrl: "/assets/certificate_template.png",
  canvasWidth: 2000,
  canvasHeight: 1414,
  coords: {
    // Participant Name (e.g. Center, Y: 680)
    name: {
      x: 1000,
      y: 690,
      font: "bold 64px 'Playfair Display', Georgia, serif",
      color: "#040032",
      align: "center" as CanvasTextAlign,
      textTransform: "uppercase",
    },
    // Matric Number / Affiliation (e.g. Center, Y: 765)
    matric: {
      x: 1000,
      y: 770,
      font: "bold 26px 'Courier New', monospace",
      color: "#0a3825",
      align: "center" as CanvasTextAlign,
    },
    // Citation / Recognition Paragraph
    citation: {
      x: 1000,
      y: 860,
      font: "italic 26px 'Playfair Display', Georgia, serif",
      color: "#2c3e50",
      align: "center" as CanvasTextAlign,
      maxWidth: 1400,
    },
    // Issue Date (Bottom Left, X: 520, Y: 1140)
    date: {
      x: 520,
      y: 1140,
      font: "bold 24px 'Courier New', monospace",
      color: "#040032",
      align: "center" as CanvasTextAlign,
    },
    // Certificate Unique ID (Bottom Right, X: 1480, Y: 1140)
    certId: {
      x: 1480,
      y: 1140,
      font: "bold 24px 'Courier New', monospace",
      color: "#0a3825",
      align: "center" as CanvasTextAlign,
    },
  },
};
