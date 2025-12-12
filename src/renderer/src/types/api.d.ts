export interface ConnectResponse {
  result: string;
}

export interface RegisterCardResponse {
  cardId: string;
  publicKey: string;
  modulus: string;
  exponent: string;
}

export interface VerifyPinResponse {
  result: string; // 'Success' | 'Locked' | 'Failed' | string
}

export interface CardIdResponse {
  result: string; // Hex string
}

export interface UploadImageRequest {
  hexData: string;
}

export interface UpdateInfoRequest {
  pin: string;
  fullName: string;
  dob: string; // ISO yyyy-MM-dd
  address: string;
  phone: string;
}

// Java Secure Info Response (inferred, as it wasn't explicitly detailed but is used in getSecureInfo)
export interface SecureInfoResponse {
  fullName: string;
  dob: string;
  address: string;
  phone: string;
  // Add other fields as returned by the middleware
}

// --- NestJS Backend DTOs ---

export interface RegisterMemberRequest {
  cardSerial: string;
  publicKey: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  dob?: string;
  avatar?: File | null;
}

export interface MemberResponse {
  id: string;
  fullName: string;
  pointBalance: number;
  status: 'Active' | 'Inactive' | 'Expired';
  tier: 'Silver' | 'Gold' | 'Diamond';
  // Add other fields as needed
}
