import { javaClient } from '../lib/api';
import {
  ConnectResponse,
  CardIdResponse,
  VerifyPinResponse,
  RegisterCardResponse,
  UpdateInfoRequest,
  UploadImageRequest,
  SecureInfoResponse,
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

  getSecureInfo: async (pin: string): Promise<SecureInfoResponse> => {
    const response = await javaClient.post<SecureInfoResponse>('/get-info-secure', { pin });
    return response.data;
  },

  changePin: async (oldPin: string, newPin: string): Promise<VerifyPinResponse> => {
    const response = await javaClient.post<VerifyPinResponse>('/change-pin', { oldPin, newPin });
    return response.data;
  },

  unblockPin: async (): Promise<VerifyPinResponse> => {
    const response = await javaClient.post<VerifyPinResponse>('/unblock-pin');
    return response.data;
  },
};
