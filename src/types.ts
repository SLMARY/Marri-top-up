export interface GameOption {
  id: string;
  name: string;
  category: string;
  hasZoneId?: boolean;
  zoneLabel?: string;
  placeholderUid: string;
  popular?: boolean;
  unavailable?: boolean;
}

export interface MembershipPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  badge?: string;
  popular?: boolean;
}

export interface DiamondPackage {
  id: string;
  name: string;
  diamonds: number;
  bonus?: number;
  price: number;
  popular?: boolean;
}

export interface MlbbDiamondPackage {
  id: string;
  name: string;
  totalDiamonds: number;
  baseDiamonds: number;
  bonusDiamonds: number;
  price: number;
  popular?: boolean;
  badge?: string;
}

export interface BloodStrikePackage {
  id: string;
  name: string;
  category: 'pass' | 'gold';
  subtitle: string;
  bonusText: string;
  price: number;
  badge: string;
  popular?: boolean;
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  whatsappNumber: string;
  billingAddress: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerRegistrationPayload {
  fullName: string;
  email: string;
  whatsappNumber: string;
  billingAddress: string;
  city: string;
  country: string;
  password: string;
  confirmPassword: string;
}

export interface CustomerLoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CustomerProfileUpdatePayload {
  fullName: string;
  whatsappNumber: string;
  billingAddress: string;
  city: string;
  country: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface PaymentInitiationPayload {
  customerId?: string;
  customerName?: string;
  whatsappNumber?: string;
  customerEmail?: string;
  billingAddress?: string;
  billingCity?: string;
  billingCountry?: string;
  gameName: string;
  playerId: string;
  serverZone?: string;
  packageId?: string;
  packageName?: string;
  amount: number;
  paymentMethod: 'visa' | 'mastercard';
}

export interface PayHereConfig {
  merchantId: string;
  isSandbox: boolean;
  businessWhatsApp: string;
  businessName: string;
  hasCustomSecret: boolean;
  configured?: boolean;
  checkoutUrl?: string;
}

export interface TransactionDetails {
  orderId: string;
  customerId?: string;
  receiptNumber?: string;
  customerName: string;
  whatsappNumber: string;
  customerEmail?: string;
  billingAddress?: string;
  billingCity?: string;
  billingCountry?: string;
  gameName: string;
  playerId: string;
  serverZone?: string;
  packageName?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED';
  isVerified?: boolean;
  paymentId?: string;
  payhereAmount?: string;
  createdAt: string;
  completedAt?: string;
  failureReason?: string;
  isSandbox?: boolean;
  businessName?: string;
  country?: string;
  paymentProvider?: string;
  whatsappSupport?: string;
}

export interface ReceiptData {
  receiptNumber: string;
  orderId: string;
  paymentId: string;
  date: string;
  customerName: string;
  customerEmail?: string;
  whatsappNumber: string;
  billingAddress?: string;
  billingCity?: string;
  billingCountry?: string;
  gameName: string;
  playerId: string;
  serverZone?: string;
  packageName?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'PAID' | 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'CANCELLED';
  businessName: string;
  country: string;
  paymentProvider: string;
  whatsappSupport: string;
}
