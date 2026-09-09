// =========================================================================
// 🎯 CERTIFICATE TEMPLATE & COORDINATES CONFIGURATION
// Coordinate space based on template native dimensions: 1024 x 577
// (Automatically scaled 2x to 2048 x 1154 during export for razor-sharp printing)
// =========================================================================

export interface FieldCoordConfig {
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "600" | "bold" | "800";
  color: string;
  align: CanvasTextAlign;
  textTransform?: "uppercase" | "capitalize" | "none";
  letterSpacing?: number;
}

export interface CertificateConfigType {
  templateImageUrl: string;
  nativeWidth: number;
  nativeHeight: number;
  coords: {
    name: FieldCoordConfig;
    matric: FieldCoordConfig;
    department: FieldCoordConfig;
    certId: FieldCoordConfig;
    institution: FieldCoordConfig;
  };
}

export const DEFAULT_CERT_CONFIG: CertificateConfigType = {
  templateImageUrl: "/assets/certificate_template.png",
  nativeWidth: 1024,
  nativeHeight: 577,
  coords: {
    name: {
      x: 523,
      y: 233,
      fontSize: 37,
      fontFamily: "'Space Mono', monospace",
      fontWeight: "bold",
      color: "#040032",
      align: "center",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    matric: {
      x: 316,
      y: 350,
      fontSize: 19,
      fontFamily: "'Space Mono', monospace",
      fontWeight: "600",
      color: "#0a3825",
      align: "left",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    department: {
      x: 288,
      y: 384,
      fontSize: 14,
      fontFamily: "'Space Mono', monospace",
      fontWeight: "600",
      color: "#040032",
      align: "left",
      textTransform: "capitalize",
      letterSpacing: 0.2,
    },
    certId: {
      x: 752,
      y: 349,
      fontSize: 18,
      fontFamily: "'Space Mono', monospace",
      fontWeight: "bold",
      color: "#040032",
      align: "left",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    institution: {
      x: 735,
      y: 384,
      fontSize: 21,
      fontFamily: "'Space Mono', monospace",
      fontWeight: "600",
      color: "#040032",
      align: "left",
      textTransform: "capitalize",
      letterSpacing: 0.2,
    },
  },
};

// Local storage key for persistent custom user mappings from Visual Mapper
export const CERT_STORAGE_KEY = "iesa_cert_custom_coords_v1";

export function getActiveCertificateConfig(): CertificateConfigType {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(CERT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.coords?.name) {
          return { ...DEFAULT_CERT_CONFIG, ...parsed, coords: { ...DEFAULT_CERT_CONFIG.coords, ...parsed.coords } };
        }
      }
    } catch {
      // Fall back to default
    }
  }
  return DEFAULT_CERT_CONFIG;
}

export const CERT_CONFIG = DEFAULT_CERT_CONFIG;
