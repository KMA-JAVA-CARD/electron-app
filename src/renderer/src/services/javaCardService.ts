import { javaClient } from '../lib/api';
import {
  ConnectResponse,
  CardIdResponse,
  VerifyPinResponse,
  RegisterCardResponse,
  UpdateInfoRequest,
  UploadImageRequest,
  SecureInfoResponse,
  GetImageHexResponse,
} from '../types/api';

export const javaCardService = {
  checkConnection: async (): Promise<ConnectResponse> => {
    const response = await javaClient.get<ConnectResponse>('/connect');
    return response.data;
  },

  getCardId: async (): Promise<CardIdResponse> => {
    const response = await javaClient.get<CardIdResponse>('/card-id');
    return response.data;
  },

  verifyPin: async (pin: string): Promise<VerifyPinResponse> => {
    const response = await javaClient.post<VerifyPinResponse>('/verify-pin', { pin });
    return response.data;
  },

  registerCard: async (pin: string): Promise<RegisterCardResponse> => {
    const response = await javaClient.post<RegisterCardResponse>('/register', { pin });

    return response.data;
  },

  updateCardInfo: async (data: UpdateInfoRequest): Promise<void> => {
    await javaClient.post('/update-info', data);
  },

  uploadCardImage: async (hexData: string): Promise<void> => {
    const payload: UploadImageRequest = { hexData };
    await javaClient.post('/upload-image', payload);
  },

  getCardImage: async (): Promise<GetImageHexResponse> => {
    const response = await javaClient.get<GetImageHexResponse>('/read-image');
    return response.data;
  },

  getSecureInfo: async (pin: string): Promise<SecureInfoResponse> => {
    const response = await javaClient.post<{ result: string }>('/get-info-secure', { pin });
    // The result return is like "full_name|date_of_birth|address|phone"
    const [fullName, dob, address, phone, points] = response.data.result.split('|');
    return { fullName, dob, address, phone, points: Number(points) };
  },

  changePin: async (oldPin: string, newPin: string): Promise<VerifyPinResponse> => {
    const response = await javaClient.post<VerifyPinResponse>('/change-pin', { oldPin, newPin });
    return response.data;
  },

  unblockPin: async (): Promise<VerifyPinResponse> => {
    const response = await javaClient.post<VerifyPinResponse>('/unblock-pin');
    return response.data;
  },

  signChallenge: async (challenge: string): Promise<{ result: string }> => {
    const response = await javaClient.post<{ result: string }>('/sign-challenge', { challenge });
    return response.data;
  },

  updatePoints: async (points: number): Promise<{ result: string }> => {
    const response = await javaClient.post<{ result: string }>('/update-points', { points });
    return response.data;
  },
};
