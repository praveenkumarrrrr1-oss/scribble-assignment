import { Router } from "express";
import {
  createRoomSchema,
  HttpError,
  joinRoomSchema,
  roomActionSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema
} from "./schemas.js";
import { createRoom, getRoom, joinRoom, startRoom, toRoomSnapshot } from "../services/roomStore.js";

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);
      const result = createRoom(playerName);

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);
      const result = joinRoom(code.toUpperCase(), playerName);

      if (!result) {
        throw new HttpError(404, "Unable to join room");
      }

      response.json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomActionSchema.parse(request.body);
      const startedRoom = startRoom(code.toUpperCase(), participantId);

      if (!startedRoom) {
        throw new HttpError(404, "Unable to start room");
      }

      response.json({
        room: toRoomSnapshot(startedRoom, participantId)
      });
    } catch (error) {
      if (error instanceof Error && error.message === "Only the host can start the game") {
        next(new HttpError(403, error.message));
      } else if (error instanceof Error && error.message === "At least two players are required to start the game") {
        next(new HttpError(400, error.message));
      } else if (error instanceof Error && error.message === "Room is not in lobby state") {
        next(new HttpError(400, error.message));
      } else {
        next(error);
      }
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const room = getRoom(code.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Unable to load room");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
