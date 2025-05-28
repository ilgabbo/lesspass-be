import { UserRole } from 'shared/enums/role.enum';

export interface TokenPayloadModel {
  userId: string;
  role: UserRole;
  iat: number;
  exp: number;
  tokenVersion: string;
  clientPublicKey: string;
  jti: string;
}
