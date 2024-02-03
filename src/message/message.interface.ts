export interface IMessage {
    id: number;
    content: string;
    participant_id: number;
    provider_id: string;
    message_type: string;
    url: string;
  }