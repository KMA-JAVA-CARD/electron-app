import { nestClient } from '../lib/api';
import {
  RegisterMemberRequest,
  MemberCardResponse,
  GetChallengeResponse,
  VerifyChallengeRequest,
  VerifyChallengeResponse,
  UpdateMemberRequest,
  TransactionRequest,
  TransactionResponse,
} from '../types/api';

export const backendService = {
  registerMember: async (data: RegisterMemberRequest): Promise<MemberCardResponse> => {
    const formData = new FormData();

    formData.append('cardSerial', data.cardSerial);
    formData.append('publicKey', data.publicKey);
    formData.append('fullName', data.fullName);
    formData.append('phone', data.phone);

    if (data.dob) formData.append('dob', data.dob);
    if (data.address) formData.append('address', data.address);
    if (data.email) formData.append('email', data.email);

    if (data.avatar) {
      formData.append('avatar', data.avatar, data.avatar.name);
    }

    const response = await nestClient.post<MemberCardResponse>('/cards/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getMemberInfo: async (cardSerial: string): Promise<MemberCardResponse> => {
    const response = await nestClient.get<MemberCardResponse>(`/cards/${cardSerial}`);
    return response.data;
  },

  updateUserInfo: async (cardSerial: string, data: UpdateMemberRequest): Promise<void> => {
    const formData = new FormData();

    // Append fields from UpdateMemberRequest
    if (data.fullName) formData.append('fullName', data.fullName);
    if (data.phone) formData.append('phone', data.phone);
    if (data.dob) formData.append('dob', data.dob);
    if (data.address) formData.append('address', data.address);
    if (data.email) formData.append('email', data.email);

    // Handle avatar file if present
    if (data.avatar) {
      formData.append('avatar', data.avatar, data.avatar.name);
    }

    await nestClient.patch(`/cards/${cardSerial}/user`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // RSA signing challenge verify
  getChallenge: async (): Promise<GetChallengeResponse> => {
    const response = await nestClient.get<GetChallengeResponse>('/cards/auth/challenge');
    return response.data;
  },

  verifyChallenge: async (data: VerifyChallengeRequest): Promise<VerifyChallengeResponse> => {
    const response = await nestClient.post<VerifyChallengeResponse>('/cards/auth/verify', data);
    return response.data;
  },

  processTransaction: async (
    cardSerial: string,
    data: TransactionRequest,
  ): Promise<TransactionResponse> => {
    const response = await nestClient.post<TransactionResponse>(
      `/cards/${cardSerial}/transaction`,
      data,
    );
    return response.data;
  },
};
