import { EndpointBuilder, EndpointParams } from '../client/types';

export const usersEndpoints = {
  list: ((params?: EndpointParams) => {
    const query = new URLSearchParams(params?.query as Record<string, string>).toString();
    return `/users${query ? `?${query}` : ''}`;
  }) as EndpointBuilder,

  create: (() => '/users') as EndpointBuilder,

  update: ((params?: EndpointParams) => `/users/${params?.id}`) as EndpointBuilder,

  delete: ((params?: EndpointParams) => `/users/${params?.id}`) as EndpointBuilder,

  details: ((params?: EndpointParams) => `/users/${params?.id}`) as EndpointBuilder,

  status: ((params?: EndpointParams) => `/users/${params?.id}/status`) as EndpointBuilder,

  resendVerificationEmail: ((params?: EndpointParams) => `/users/${params?.id}/resend-verification-email`) as EndpointBuilder,
}; 