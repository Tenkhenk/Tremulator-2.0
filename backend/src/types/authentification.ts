export interface ValidateCodeRequest {
  client_id: string;
  code: string;
  code_verifier: string;
  grant_type: string;
  redirect_uri?: string;
}

export interface ValidateCodeResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

export interface User {
  email?: string;
  mail?: string;
  name?: string;
}
