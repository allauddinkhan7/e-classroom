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


/*

Normal HTTP requests carry your JWT in a header, checked by JwtAuthGuard on every single request. A WebSocket connection is different —
you connect once, then send many events over that same open line — so we can't re-check a header per request the same way. Instead:

When the frontend calls io(url, { auth: { token } }), it hands the JWT over during the handshake (the initial "hello, let's connect" moment).
Our WsJwtGuard verifies that token — but not just once at connection time. It re-runs on every event the client sends (@UseGuards(WsJwtGuard) 
sits on each @SubscribeMessage), and on success it stores who you are on client.data.user. Think of it like this: you show your ID once to get in the building,
but you also have to badge in at every single door inside — nobody's trusted just because they made it through the front entrance.
*/