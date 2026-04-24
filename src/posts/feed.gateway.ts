import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { getCorsOrigins } from '../cors-origins';

/**
 * Mismo evento de payload que un post del feed HTTP (incl. likesCount, etc.).
 * Cliente: `io(url, { withCredentials: true })` y `socket.on('post:created', (post) => …)`.
 */
@WebSocketGateway({
  cors: { origin: getCorsOrigins(), credentials: true },
  transports: ['websocket', 'polling'],
})
export class FeedGateway {
  private readonly logger = new Logger(FeedGateway.name);

  @WebSocketServer()
  server!: Server;

  /** Solo posts publicados (no borradores), tras persistir. */
  emitPostCreated(post: unknown) {
    if (!this.server) {
      this.logger.warn('WebSocket server not ready, skip post:created');
      return;
    }
    this.server.emit('post:created', post);
  }
}
