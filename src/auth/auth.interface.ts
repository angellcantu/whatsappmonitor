'use strict';

/* functions */
export interface IAuthRepository {
    signInKeys(private_key: string, public_key: string): Promise<IAuthToken>;
}

/* keys */
export interface IAuthKeys {
    private_key: string;
    public_key: string;
}

/* token */
export interface IAuthToken {
    token: string;
}

/* user information */
export interface IAuthUser {
    id: number;
    name: string;
    public_key: string;
}