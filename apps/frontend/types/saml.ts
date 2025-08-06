export interface SAMLConnection {
  clientID: string;
  clientSecret: string;
  defaultRedirectUrl: string;
  redirectUrl: string;
  tenant: string;
  product: string;
  deactivated?: boolean;
}
