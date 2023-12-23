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
  @SubscribeMessage('createMentoringSession')
  async create(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody() createMentoringSessionDto: CreateMentoringSessionDto,
  ) {
    const mentoringSession =
      await this.mentoringSessionGatewayService.createRoom(
        createMentoringSessionDto,
      );
    await this.mentoringSessionGatewayService.createMentoring(
      client.user.userId,
      mentoringSession.id,
    );
    client.join(mentoringSession.id + mentoringSession.topic);
    await this.mentoringSessionGatewayService.join(
      mentoringSession.id,
      client.user.userId,
    );
    return mentoringSession;
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('findAllMentoringSession')
  async findAll(
    @ConnectedSocket()
    client: CustomSocket,
  ) {
    const sessions = await this.mentoringSessionGatewayService.findAll();
    for (const session of sessions) {
      await this.mentoringSessionGatewayService.out(
        session.id,
        client.user.userId,
      );
    }
    const user = client.user;
    return { sessions, user };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('findAllMyMentoringSession')
  async findAllMySessions(
    @ConnectedSocket()
    client: CustomSocket,
  ) {
    const sessions = await this.mentoringSessionGatewayService.findAllByUser(
      client.user.userId,
    );
    for (const session of sessions) {
      client.join(session.id + session.topic);
    }
    return sessions;
  }

  @SubscribeMessage('findOneMentoringSession')
  findOne(@MessageBody() id: number) {
    return this.mentoringSessionGatewayService.findOne(id);
  }

  @SubscribeMessage('updateMentoringSession')
  update(@MessageBody() updateMentoringSessionDto: UpdateMentoringSessionDto) {
    return this.mentoringSessionGatewayService.update(
      updateMentoringSessionDto.id,
      updateMentoringSessionDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('message')
  async saveMessage(
    @ConnectedSocket() client: CustomSocket,
    @MessageBody('session_id') session_id: number,
    @MessageBody('topic') topic: string,
    @MessageBody('message') message: string,
  ) {
    console.log('check', session_id, message, client.user.userId);
    await this.messagesService.create({
      mentoring_session_id: session_id,
      message,
      user_id: client.user.userId,
    });
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

    this.server.to(session_id + topic).emit('updateSession', { session });
    // return this.mentoringSessionGatewayService.update(
    //   updateMentoringSessionDto.id,
    //   updateMentoringSessionDto,
    // );
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinRoom')
  async joinRoom(
    @ConnectedSocket()
    client: CustomSocket,
    @MessageBody('session_id') session_id: number,
  ) {
    const session = await this.mentoringSessionGatewayService.createMentoring(
      client.user.userId,
      session_id,
    );

    const mentoring = await this.mentoringSessionGatewayService.join(
      session_id,
      client.user.userId,
    );

    client.join(session_id + session.topic);

    await this.messagesService.readSessionsMessage(
      mentoring.mentee_id,
      session_id,
    );

    // client
    //   .to(room.mentoringSession.id + room.mentoringSession.topic)
    //   .emit('message', { room });
    return {
      event: 'enterRoom',
      data: {
        mentoring,
        session: mentoring.mentoringSession,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('enterRoom')
  async changeRoom(
    @ConnectedSocket()
    client: CustomSocket,
    @MessageBody('session_id') session_id: number,
  ) {
    const mentoring = await this.mentoringSessionGatewayService.join(
      session_id,
      client.user.userId,
    );

    client.join(session_id + mentoring.mentoringSession.topic);

    await this.messagesService.readSessionsMessage(
      mentoring.mentee_id,
      session_id,
    );

    const session =
      await this.mentoringSessionGatewayService.findOne(session_id);

    // client
    //   .to(room.mentoringSession.id + room.mentoringSession.topic)
    //   .emit('message', { room });
    return {
      event: 'enterRoom',
      data: {
        mentoring,
        session,
      },
    };
  }

  @SubscribeMessage('removeMentoringSession')
  remove(@MessageBody() id: number) {
    return this.mentoringSessionGatewayService.remove(id);
  }
}
