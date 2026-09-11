import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.auth?.token;

    if (!token) {
      throw new UnauthorizedException("Missing token");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // client.data.user is the WebSocket equivalent of request.user
      client.data.user = {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        fullName: payload.fullName,
      };
      return true;
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}

// A small auth helper for WebSocket connections.
// HTTP requests carry the JWT in a header; Socket.IO connections carry it differently (a handshake auth object),
// so we need a small adapter — not a full rewrite of JwtAuthGuard, just a way to verify the same token at connection time.
