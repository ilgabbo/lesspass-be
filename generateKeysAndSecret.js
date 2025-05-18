import { x25519 } from '@noble/curves/ed25519';

function toHex(uint8arr) {
  return Buffer.from(uint8arr).toString('hex');
}

function main() {
  // Genera chiavi client
  const clientPrivateKey = x25519.utils.randomPrivateKey();
  const clientPublicKey = x25519.getPublicKey(clientPrivateKey);

  // Genera chiavi server
  const serverPrivateKey = x25519.utils.randomPrivateKey();
  const serverPublicKey = x25519.getPublicKey(serverPrivateKey);

  console.log('Client Private Key:', toHex(clientPrivateKey));
  console.log('Client Public Key:', toHex(clientPublicKey));
  console.log('Server Private Key:', toHex(serverPrivateKey));
  console.log('Server Public Key:', toHex(serverPublicKey));

  // Calcola shared secret lato client (clientPrivateKey + serverPublicKey)
  const clientSharedSecret = x25519.getSharedSecret(clientPrivateKey, serverPublicKey);

  // Calcola shared secret lato server (serverPrivateKey + clientPublicKey)
  const serverSharedSecret = x25519.getSharedSecret(serverPrivateKey, clientPublicKey);

  console.log('Client Shared Secret:', toHex(clientSharedSecret));
  console.log('Server Shared Secret:', toHex(serverSharedSecret));

  // Verifica che combacino
  if (toHex(clientSharedSecret) === toHex(serverSharedSecret)) {
    console.log('✅ Shared secrets match!');
  } else {
    console.log('❌ Shared secrets DO NOT match!');
  }
}

main();
