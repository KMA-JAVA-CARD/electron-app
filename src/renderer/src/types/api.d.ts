export interface ConnectResponse {
  result: string;
}

export interface RegisterCardResponse {
  cardId: string;
  publicKey: string;
  modulus: string;
  exponent: string;
}

export interface CardIdResponse {
  result: string; // Hex string
}

export interface UploadImageRequest {
  hexData: string;
}

export interface GetImageHexResponse {
  result: string;
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

export interface MemberCardResponse {
  id: number;
  cardSerial: string;
  publicKey: string;
  pointBalance: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    fullName: string;
    phone: string;
    email: string | null;
    address: string | null;
    dob: Date | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface VerifyPinResponse {
  success: boolean;
  message: string;
  remainingTries: number; // -1 if not applicable, > 0 if retrying, 0 if locked
  sw: string; // Status Word (e.g., "9000", "63C2", "6983")
}

export interface ChangePinRequest {
  oldPin: string;
  newPin: string;
}

// RSA signing challenge verify
export interface GetChallengeResponse {
  challenge: string;
}

export interface VerifyChallengeRequest {
  cardSerial: string;
  challenge: string;
  signature: string;
}

export interface VerifyChallengeResponse {
  success: boolean;
  message: string;
}
