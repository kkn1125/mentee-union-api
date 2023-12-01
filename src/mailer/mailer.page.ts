import { Injectable } from '@nestjs/common';

type MailFormat = {
  title: string;
  content: string;
  href: string;
  onclick: string;
  closeBtnText: string;
};

@Injectable()
export class MailerPage {
  format({ title, content, href, onclick, closeBtnText }: MailFormat) {
    return `<script>
        function closing(){
          window.close();
        }
      </script>
      <h3>${title}</h3>
      <h5>${content}</h5>
      <div>
        <a href="${href}" onclick="${onclick}">${closeBtnText}</a>
      </div>
    `;
  }
  success(): MailFormat {
    return {
      title: '✅ Check Success!',
      content:
        '인증이 완료되었습니다. 작업 페이지로 돌아가 나머지 작업을 완료해주세요.<br />아래 닫기를 눌러 창을 닫아주세요.',
      href: 'javascript:void',
      onclick: 'closing()',
      closeBtnText: '닫기',
    };
  }
  tokenNoExists(): MailFormat {
    return {
      title: '❌ Check Fail!',
      content: '존재하지 않는 토큰입니다.',
      href: 'javascript:void',
      onclick: 'closing()',
      closeBtnText: '닫기',
    };
  }
  tokenExpired(): MailFormat {
    return {
      title: '❌ Check Fail!',
      content: '토큰 검증 기간이 만료되었습니다.',
      href: 'javascript:void',
      onclick: 'closing()',
      closeBtnText: '닫기',
    };
  }
  alreadyUsedEmail(): MailFormat {
    return {
      title: '❌ Check Fail!',
      content: '이미 사용 중인 이메일 입니다. 다른 이메일을 사용해주세요.',
      href: 'javascript:void',
      onclick: 'closing()',
      closeBtnText: '닫기',
    };
  }
  invalidFormat() {
    return {
      title: '❌ Check Fail!',
      content: '유효한 토큰이 아닙니다.',
      href: 'javascript:void',
      onclick: 'closing()',
      closeBtnText: '닫기',
    };
  }
  usedToken() {
    return {
      title: '❌ Check Fail!',
      content:
        '이미 검증 되었습니다. 재시도하려면 작업 페이지에서 다시 인증 요청을 해주세요.',
      href: 'javascript:void',
      onclick: 'closing()',
      closeBtnText: '닫기',
    };
  }
  accessDenied() {
    return {
      title: '❌ Check Fail!',
      content: '유효하지 않은 접근입니다.',
      href: 'javascript:void',
      onclick: 'closing()',
      closeBtnText: '닫기',
    };
  }
  output(type: string) {
    switch (type) {
      case 'success':
        return this.format(this.success());

      case 'token no exists':
        return this.format(this.tokenNoExists());

      case 'expired':
        return this.format(this.tokenExpired());

      case 'already used email':
        return this.format(this.alreadyUsedEmail());

      case 'invalid token format':
        return this.format(this.invalidFormat());

      case 'already used':
        return this.format(this.usedToken());

      default:
        return this.format(this.accessDenied());
    }
  }
}
