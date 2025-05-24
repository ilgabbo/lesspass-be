import { Endpoint } from 'shared/enums/endpoint.enum';

export const noSecretEndpoints = [
  `${Endpoint.GLOBAL}/${Endpoint.SIGNIN}`,
  `${Endpoint.GLOBAL}/${Endpoint.SIGNIN}`,
];

export const noEncryptionEndpoints = [`${Endpoint.GLOBAL}/${Endpoint.KEY}`];
