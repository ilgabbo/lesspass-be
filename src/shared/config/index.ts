import { Endpoint } from 'shared/enums/endpoint.enum';

export const noKeyEndpoints = [
  `${Endpoint.GLOBAL}/${Endpoint.SIGNIN}`,
  `${Endpoint.GLOBAL}/${Endpoint.SIGNUP}`,
];

export const noEncryptionEndpoints = [`${Endpoint.GLOBAL}/${Endpoint.KEY}`];

export const protectedRoutes = [
  `${Endpoint.GLOBAL}/${Endpoint.FOLDERS}`,
  `${Endpoint.GLOBAL}/${Endpoint.PASSWORDS}`,
  `${Endpoint.GLOBAL}/${Endpoint.TAGS}`,
];

export const TOKEN_EXP = '15mins';
