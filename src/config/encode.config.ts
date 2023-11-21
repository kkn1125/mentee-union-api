import { registerAs } from '@nestjs/config';

export default registerAs('encode', () => ({
  privkey: process.env.PRIVKEY,
}));
