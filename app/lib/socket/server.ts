// src/lib/socket/server.ts
import { Server as NetServer } from "http";
import { Server as SocketServer } from "socket.io";
import type { NextApiRequest } from "next";
import type { Socket as NetSocket } from "net";
import type { ServerResponse } from "http";

export type NextApiResponseWithSocket = ServerResponse & {
  socket: NetSocket & {
    server: NetServer & { io?: SocketServer };
  };
};

export const initSocketServer = (res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    const io = new SocketServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: process.env.NEXTAUTH_URL, methods: ["GET", "POST"] },
    });

    io.on("connection", (socket) => {
      console.log(`[Socket] Client connected: ${socket.id}`);

      // Join a post's comment room
      socket.on("join-post", (postId: string) => {
        socket.join(`post:${postId}`);
        console.log(`[Socket] ${socket.id} joined post:${postId}`);
      });

      socket.on("leave-post", (postId: string) => {
        socket.leave(`post:${postId}`);
      });

      // Broadcast new comment to room
      socket.on("new-comment", (data: { postId: string; comment: unknown }) => {
        socket.to(`post:${data.postId}`).emit("comment-added", data.comment);
      });

      // Typing indicator
      socket.on("typing", (data: { postId: string; user: string }) => {
        socket.to(`post:${data.postId}`).emit("user-typing", data.user);
      });

      socket.on("disconnect", () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
};

// ─── Client-side hook ────────────────────────────────────────────────────────
// src/hooks/useCommentSocket.ts (included here for reference)
export const SOCKET_HOOK_EXAMPLE = `
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export function useCommentSocket(postId: string, onNewComment: (comment: unknown) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetch("/api/socket"); // initialize server
    socketRef.current = io({ path: "/api/socket", addTrailingSlash: false });
    
    socketRef.current.emit("join-post", postId);
    socketRef.current.on("comment-added", onNewComment);

    return () => {
      socketRef.current?.emit("leave-post", postId);
      socketRef.current?.disconnect();
    };
  }, [postId, onNewComment]);

  const emitNewComment = (comment: unknown) => {
    socketRef.current?.emit("new-comment", { postId, comment });
  };

  return { emitNewComment };
}
`;
