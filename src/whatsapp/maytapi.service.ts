'use strict';

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';

@Injectable()
export class MaytApiService {

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService
    ) { }

    public async sendMessage(message: string, phone: string, phone_id?: number) {
        let body = {
            message: message,
            type: 'text',
            to_number: phone
        };
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.post(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${phone_id ? phone_id : this.config.get<string>('PHONE_ID')}/sendMessage`,
                { ...body },
                { headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': this.config.get<string>('API_TOKEN')
                } }
            ).pipe(
                catchError((error: AxiosError) => {
                    throw new HttpException(error.message, HttpStatus.CONFLICT);
                })
            )
        );
        return data;
    }

    public async sendLocation(params: { latitude: string, longitude: string, phone: string, phone_id?: number }) {
        let body = {
            type: 'location',
            latitude: params.latitude,
            longitude: params.longitude,
            to_number: params.phone
        };
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.post(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${params?.phone_id ? params?.phone_id : this.config.get<string>('PHONE_ID')}/sendMessage`,
                { ...body },
                { headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': this.config.get<string>('API_TOKEN')
                } }
            ).pipe(
                catchError((error: AxiosError) => {
                    throw new HttpException(error.message, HttpStatus.CONFLICT);
                })
            )
        );
        return data;
    }

    public async getContactsByPhoneIdentifier(phone_id: number) {
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.get(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${phone_id}/contacts`,
                { headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': this.config.get<string>('API_TOKEN')
                } }
            ).pipe(
                catchError((error: AxiosError) => {
                    throw new HttpException(error.message, HttpStatus.CONFLICT);
                })
            )
        );
        return data;
    }

    public async getContactInformation(id: string, phone_id?: number) {
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.get(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${phone_id ? phone_id : this.config.get<string>('PHONE_ID')}/contact/${id}`,
                { headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': this.config.get<string>('API_TOKEN')
                } }
            ).pipe(
                catchError((error: AxiosError) => {
                    throw new HttpException(error.message, HttpStatus.CONFLICT);
                })
            )
        );
        return data;
    }

    public async getGroupInformation(id: string, phone_id?: number) {
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.get(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${phone_id ? phone_id : this.config.get<string>('PHONE_ID')}/getGroups/${id}`,
                { headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': this.config.get<string>('API_TOKEN')
                } }
            ).pipe(
                catchError((error: AxiosError) => {
                    throw new HttpException(error.message, HttpStatus.CONFLICT);
                })
            )
        );
        return data;
    }

    public async getConversation(id: string, phone_id?: number) {
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.get(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${phone_id ? phone_id : this.config.get<string>('PHONE_ID')}/getConversations/${id}`,
                { headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': this.config.get<string>('API_TOKEN')
                } }
            ).pipe(
                catchError((error: AxiosError) => {
                    throw new HttpException(error.message, HttpStatus.CONFLICT);
                })
            )
        );
        return data;
    }

    public async sendPoll(params: { phone: string, message: string, options?: Array<string>, phone_id?: number }) {
        let body = {
            to_number: params.phone,
            type: 'poll',
            message: params.message,
            options: params?.options || [],
            only_one: true
        };
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.post(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${params?.phone_id ? params?.phone_id : this.config.get<string>('PHONE_ID')}/sendMessage`,
                { ...body },
                { headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': this.config.get<string>('API_TOKEN')
                } }
            ).pipe(
                catchError((error: AxiosError) => {
                    throw new HttpException(error.message, HttpStatus.CONFLICT);
                })
            )
        );
        return data;
    }

    public async createGroup(params: { name: string, integrants: Array<string>, message?: string}) {
        let body = {
            name: params.name,
            numbers: params.integrants,
            sendInvite: true,
            message: params.message || 'Hello!'
        };
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.post(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${this.config.get<string>('PHONE_ID')}/createGroup`,
                { ...body },
                { headers: {
                    'Content-Type': 'application/json',
                    'x-maytapi-key': this.config.get<string>('API_TOKEN')
                } }
            ).pipe(
                catchError((error: AxiosError) => {
                    console.log(error);
                    throw new HttpException(error.message, HttpStatus.CONFLICT);
                })
            )
        );
        return data;
    }

    public async fetchImage(url: string) {
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.get(url, { responseType: 'arraybuffer' }).pipe(
                catchError((error: AxiosError) => {
                    throw new HttpException(error.message, HttpStatus.CONFLICT);
                })
            )
        );
        return data;
    }

}