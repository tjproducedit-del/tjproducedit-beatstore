export type LicenseType = "BASIC" | "PREMIUM" | "EXCLUSIVE";

export interface Beat {
  id: string;
  title: string;
  slug: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  price: number;
  exclusivePrice: number | null;
  licenseType: LicenseType;
  artworkUrl: string;
  mp3Url: string;
  wavUrl: string;
  previewUrl: string;
  duration: number;
  plays: number;
  isActive: boolean;
  isSold: boolean;
  createdAt: string;
}

export interface CartItem {
  beat: Beat;
  licenseType: LicenseType;
  price: number;
}

export interface Order {
  id: string;
  email: string;
  customerName: string | null;
  total: number;
  status: string;
  paymentProvider: string;
  paymentId: string;
  downloadToken: string;
  downloadCount: number;
  maxDownloads: number;
  tokenExpiresAt: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  beatId: string;
  price: number;
  licenseType: LicenseType;
  beat?: Beat;
}

export interface LicenseOption {
  type: LicenseType;
  label: string;
  description: string;
  features: string[];
}

export const LICENSE_OPTIONS: LicenseOption[] = [
  {
    type: "BASIC",
    label: "Basic Lease",
    description: "MP3 file, tagged",
    features: [
      "MP3 file (320kbps)",
      "Up to 5,000 streams",
      "Non-exclusive rights",
      "Must credit producer",
    ],
  },
  {
    type: "PREMIUM",
    label: "Premium Lease",
    description: "MP3 + WAV, untagged",
    features: [
      "MP3 + WAV files",
      "Up to 50,000 streams",
      "Non-exclusive rights",
      "Must credit producer",
    ],
  },
  {
    type: "EXCLUSIVE",
    label: "Exclusive Rights",
    description: "Full ownership transfer",
    features: [
      "All file formats",
      "Unlimited streams",
      "Full exclusive rights",
      "Beat removed from store",
    ],
  },
];
