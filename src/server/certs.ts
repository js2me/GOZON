import type { SecureContextOptions } from 'node:tls';
import selfsigned from 'selfsigned';

export async function generateTlsOptions(): Promise<SecureContextOptions> {
  const result = await selfsigned.generate(
    [{ name: 'commonName', value: 'localhost' }],
    {
      keySize: 2048,
      algorithm: 'sha256',
      extensions: [
        {
          name: 'subjectAltName' as const,
          altNames: [
            { type: 2, value: 'localhost' },
            { type: 7, ip: '127.0.0.1' },
            { type: 7, ip: '::1' },
          ],
        },
      ],
    },
  );

  return {
    cert: result.cert,
    key: result.private,
  };
}
