import { ApiResponseService } from '@/api-response/api-response.service';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class CheckEmailPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') return value;

    // console.log('body check', metadata.data, value);
    /* email format regex */
    /**
     * 규칙은 다음과 같습니다.
     * 1. 사용자명은 2자 이상, 영문부터 시작
     * 2. 도메인은 2자 이상, 영문부터 시작
     * 3. 최상위 도메인은 2자 이상, 영문만 취급
     * 이메일 구성에 관한 문건 @see https://namu.wiki/w/%EC%9D%B4%EB%A9%94%EC%9D%BC#s-3.1
     */
    const isEmailFormat = value.match(
      /\b(?![0-9_\-]+)(?=.*[A-Za-z])(?=.*[_\-0-9]*)[A-Za-z_\-0-9]{2,}\@(?![0-9_\-]+)[ㄱ-힣A-Za-z0-9_\-]{2,}\.(?=.*[A-Za-z])[A-Za-z]{2,}\b/g,
    );

    if (isEmailFormat) {
      return value;
    } else {
      ApiResponseService.BAD_REQUEST('not matched email format');
    }
  }
}
