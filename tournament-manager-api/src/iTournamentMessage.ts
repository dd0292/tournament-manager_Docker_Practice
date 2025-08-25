export interface iTournamentMessage {
    _id: string;
    title: string;
    type: string;
    roster: {
        id: number;
        name: string;
        weight: number;
        age: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface iPlayer {
  id: number;
  name: string;
  weight: number;
  age: number;
}