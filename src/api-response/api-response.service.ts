import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiResponseService {
  ok?: boolean;
  code?: number;
  data?: any;
  message?: string;
  detail?: string | string[];

  output(datas?: {
    ok?: boolean;
    code?: number;
    data?: any;
    message?: string;
    detail?: string | string[];
  }) {
    Object.assign(this, datas);
    const { ok, code, data, message, detail } = this;
    return { ok, code, data, message, detail };
  }
}
