import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { _ } from 'lodash';

class User {
  id: string;
  name: string;
  mediaId: string;
}

class Room {
  id!: string;
  users: User[] = new Array<User>();

  constructor(id: string) {
    this.id = id;
  }
}

@WebSocketGateway({
  transports: ['websocket'],
  cors: '*',
})
export class RoomGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;
  private logger: Logger = new Logger('AppGateway');
  private rooms: Room[] = new Array<Room>();

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  @SubscribeMessage('join-room')
  handleEvent(client: Socket, data) {
    let room: Room = this.getRoom(data.room);
    client.join(data.room);
    this.server.to(data.room).emit('user-connected', data.user);
    client.on('disconnect', () => {
      this.server.to(data.room).emit('user-disconnected', data.user.id);
      const userIndex = room.users.findIndex((u) => u.id === data.user.id);
      room.users.splice(userIndex, 1);
    });
    if (room) {
      room.users.push(data.user);
    } else {
      room = new Room(data.room);
      room.users.push(data.user);
      this.rooms.push(room);
    }
  }

  private getRoom(id: string): Room {
    return this.rooms.find((room: Room) => room.id === id);
  }

  @SubscribeMessage('userInfo')
  handerUserEvent(client: Socket, data) {
    const room = this.rooms.find((room: Room) => room.id === data.room);
    if (room) {
      return room.users.find((user: User) => user.id === data.id);
    }
  }

  @SubscribeMessage('message')
  handlerMessage(client: Socket, data) {
    this.server.to(data.room).emit('message', data.message);
  }

  @SubscribeMessage('speeking')
  handleSpeeking(client: Socket, data) {
    this.setWhoSpeeking()(data);
  }

  @SubscribeMessage('shareStream')
  handleshareStream(client: Socket, data) {
    this.server.to(data.room).emit('shareStream', data.id);
  }

  private setWhoSpeeking(): (data: any) => void {
    return _.debounce((data) => {
      this.server.to(data.room).emit('user-speeking', data.id);
    }, 300);
  }
}
