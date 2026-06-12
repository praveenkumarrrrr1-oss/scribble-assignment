export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "active";

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
}

export interface ActiveRound {
  drawerId: string;
  secretWord: string;
}

export interface Room {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  activeRound?: ActiveRound;
  createdAt: string;
  updatedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId: string;
  participants: Participant[];
  availableWords: string[];
  roles: ParticipantRole[];
  drawerId?: string;
  viewerRole?: ParticipantRole;
  secretWord?: string;
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
