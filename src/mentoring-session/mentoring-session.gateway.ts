import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { CreateMentoringSessionDto } from './dto/create-mentoring-session.dto';
import { MentoringSessionGatewayService } from './mentoring-session-gateway.service';
import { UpdateMentoringSessionDto } from './dto/update-mentoring-session.dto';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { MessagesService } from '@/messages/messages.service';
import { ApiResponseService } from '@/api-response/api-response.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/channel',
})
export class MentoringSessionGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly mentoringSessionGatewayService: MentoringSessionGatewayService,
    private readonly messagesService: MessagesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('initialize')
  async initialize(@ConnectedSocket() client: CustomSocket) {
    await this.mentoringSessionGatewayService.updateStausByUserId(
      client.user.userId,
    );
    const sessionList = await this.mentoringSessionGatewayService.findAll();
    const userData = client.user;
    client.emit('sessionList', { sessionList });
    client.emit('userData', { user: userData });
    client.emit('nowSession', { session: null });
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('createSession')
  async create(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() createMentoringSessionDto: CreateMentoringSessionDto,
  ) {
    const session = await this.mentoringSessionGatewayService.createRoom(
      createMentoringSessionDto,
    );

    await this.mentoringSessionGatewayService.createMentoring(
      client.user.userId,
      session.id,
      'enter',
    );

    await this.messagesService.create({
      mentoring_session_id: session.id,
      message: client.user.username + '님이 입장했습니다.',
      user_id: null,
    });

    const newSession = await this.mentoringSessionGatewayService.findOne(
      session.id,
    );

    this.server.emit('updateSession', { session: newSession });

    return {
      event: 'nowSession',
      data: {
        session: newSession,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinSession')
  async join(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody('session_id') session_id: number,
  ) {
    /* 세션 수용 인원 제한 체크 */
    const session =
      await this.mentoringSessionGatewayService.findOne(session_id);
    if (session.limit <= session.mentorings.length) {
      return {
        event: 'reject',
        data: {
          message: 'Session limit exceeded',
        },
      };
    }

    /* 멘토링 생성 */
    await this.mentoringSessionGatewayService.createMentoring(
      client.user.userId,
      session_id,
      'enter',
    );

    /* 입장 메세지 */
    await this.messagesService.create({
      mentoring_session_id: session_id,
      message: client.user.username + '님이 입장했습니다.',
      user_id: null,
    });

    /* 멘토링 메세지 읽음 표시 */
    const enteredMentorings =
      await this.mentoringSessionGatewayService.findEnteredMentees(session_id);

    for (const mentoring of enteredMentorings) {
      await this.messagesService.readSessionsMessage(
        mentoring.mentee_id,
        session_id,
      );
    }

    const newSession =
      await this.mentoringSessionGatewayService.findOne(session_id);

    this.server.emit('updateSession', { session: newSession });

    return {
      event: 'nowSession',
      data: {
        session: newSession,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('outSession')
  async out(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody('session_id') session_id: number,
  ) {
    /* 멘토링 제거 */
    await this.mentoringSessionGatewayService.removeMentoring(
      client.user.userId,
      session_id,
    );

    /* 세션 인원 0명일 시 자동 제거, 아닐 시 잔여 인원에게 퇴장 메세지 */
    const session =
      await this.mentoringSessionGatewayService.findOne(session_id);
    if (session.mentorings.length === 0) {
      await session.remove();
    } else {
      await this.messagesService.create({
        mentoring_session_id: session_id,
        message: client.user.username + '님이 퇴장했습니다.',
        user_id: null,
      });
    }

    const newSession =
      await this.mentoringSessionGatewayService.findOne(session_id);

    this.server.emit('updateSession', { session: newSession });

    return {
      event: 'nowSession',
      data: {
        session: null,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('waitlist')
  async waitlist(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody('session_id') session_id: number,
  ) {
    /* 해당 사용자 대기열로 모든 세션 상태 변경 */
    await this.mentoringSessionGatewayService.updateStausByUserId(
      client.user.userId,
      'waitlist',
    );

    const session =
      await this.mentoringSessionGatewayService.findOne(session_id);

    this.server.emit('updateSession', { session: session });

    return {
      event: 'nowSession',
      data: {
        session: null,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('changeSession')
  async change(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody('session_id') session_id: number,
  ) {
    /* 해당 세션의 사용자 멘토링 상태 enter로 변경 */
    await this.mentoringSessionGatewayService.updateStatus(
      client.user.userId,
      session_id,
      'enter',
    );

    /* 멘토링 메세지 읽음 표시 */
    const enteredMentorings =
      await this.mentoringSessionGatewayService.findEnteredMentees(session_id);

    for (const mentoring of enteredMentorings) {
      await this.messagesService.readSessionsMessage(
        mentoring.mentee_id,
        session_id,
      );
    }

    const session =
      await this.mentoringSessionGatewayService.findOne(session_id);

    this.server.emit('updateSession', { session: session });

    return {
      event: 'nowSession',
      data: {
        session: session,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('saveMessage')
  async saveMessage(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody('session_id') session_id: number,
    @MessageBody('message') message: string,
  ) {
    /* 메세지 생성 */
    await this.messagesService.create({
      mentoring_session_id: session_id,
      message,
      user_id: client.user.userId,
    });

    /* 멘토링 메세지 읽음 표시 */
    const enteredMentorings =
      await this.mentoringSessionGatewayService.findEnteredMentees(session_id);

    for (const mentoring of enteredMentorings) {
      await this.messagesService.readSessionsMessage(
        mentoring.mentee_id,
        session_id,
      );
    }

    const session =
      await this.mentoringSessionGatewayService.findOne(session_id);

    this.server.emit('updateSession', { session: session });
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('deleteMessage')
  async deleteMessage(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody('session_id') session_id: number,
    @MessageBody('message_id') message_id: number,
  ) {
    /* 메세지 삭제 */
    await this.messagesService.softRemove(message_id);

    /* 멘토링 메세지 읽음 표시 */
    const enteredMentorings =
      await this.mentoringSessionGatewayService.findEnteredMentees(session_id);

    for (const mentoring of enteredMentorings) {
      await this.messagesService.readSessionsMessage(
        mentoring.mentee_id,
        session_id,
      );
    }

    const session =
      await this.mentoringSessionGatewayService.findOne(session_id);

    this.server.emit('updateSession', { session: session });
  }
}
