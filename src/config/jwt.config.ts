import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  privkey: process.env.PRIVKEY,
}));
