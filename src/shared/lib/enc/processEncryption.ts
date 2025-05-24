/* eslint-disable @typescript-eslint/no-unsafe-argument */
import env from 'shared/env';
import crypto from 'crypto';
import { x25519 } from '@noble/curves/ed25519';

export const processEncryption = (
  clientPublicKey: string,
  mode: 'encrypt' | 'decrypt',
  data: object | string,
) => {
  const serverPrivateKeyHex = env.SERVER_PRIVATE_KEY;
  const sharedSecretUint8 = x25519.getSharedSecret(
    serverPrivateKeyHex,
    clientPublicKey,
  );

  const sharedSecret = Buffer.from(sharedSecretUint8);

  if (mode === 'decrypt') {
    const [ivBase64, encrypted] = (data as string).split(':');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      sharedSecret,
      Buffer.from(ivBase64, 'base64'),
    );
    decipher.setAutoPadding(true);
    const encryptedData = Buffer.from(encrypted, 'base64');
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final(),
    ]);

    return decrypted.toString('utf-8');
  } else {
    // encrypt
    const randomIv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', sharedSecret, randomIv);
    cipher.setAutoPadding(true);
    const encrypted = Buffer.concat([
      cipher.update(Buffer.from(JSON.stringify(data))),
      cipher.final(),
    ]);
    return randomIv.toString('base64') + ':' + encrypted.toString('base64');
  }
};
