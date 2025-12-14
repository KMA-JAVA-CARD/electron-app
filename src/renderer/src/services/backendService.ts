import { nestClient } from '../lib/api';
import { RegisterMemberRequest, MemberCardResponse } from '../types/api';

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
};
