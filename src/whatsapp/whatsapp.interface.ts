'use strict';

/* vcard list object */
interface IVcardList {
    vcard?: string;
}

/* statuses object */
interface IStatuses {
    status?: string;
}

/* message object */
interface IMessage {
    type: 'text' | 'document' | 'image' | 'audio' | 'location' | 'vcard' | 'poll' | 'info' | 'sticket' | 'ptt';
    text?: string;
    url?: string;
    mime?: string;
    filename?: string;
    caption?: string;
    payload?: string;
    vcardList?: Array<IVcardList>;
    subtype?: string;
    participant?: string;
    id?: string;
    _serialized?: string;
    fromMe: boolean;
    statuses?: Array<IStatuses>;
}

/* user object */
interface IUser {
    id?: string;
    name?: string;
    phone?: string;
}

/* data object / options */
export interface IDataOptions {
    name?: string;
    id?: number;
    votes?: number;
}

/* data object */
interface IData {
    msgId?: string;
    chatId?: string;
    time?: number;
    options?: Array<IDataOptions>;
    text?: string;
    rxid?: string;
}

/* message type */
type TMessage = 'message' | 'ack';

/* main whatsapp object */
export interface IWebhook {
    product_id?: string;
    phone_id?: number;
    message?: IMessage;
    user?: IUser;
    conversation?: string;
    conversation_name?: string;
    receiver?: string;
    timestamp?: string;
    type?: TMessage;
    reply?: string;
    productId?: string;
    phoneId?: number;
    status?: string;
    data?: Array<IData>;
}

/* credentials response */
export interface IPhoneCredentials {
    id: number;
    user_id?: number | null;
    name: string;
    description: string;
    public_key: string;
    private_key: string;
    active: boolean | number;
    created_at: Date;
    updated_at: Date | null;
}