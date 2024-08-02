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

    public async sendMessage(message: string, phone: string) {
        let body = {
            message: message,
            type: 'text',
            to_number: phone
        };
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.post(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${this.config.get<string>('PHONE_ID')}/sendMessage`,
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

    public async sendLocation(latitude: string, longitude: string, phone: string) {
        let body = {
            type: 'location',
            latitude: latitude,
            longitude: longitude,
            to_number: phone
        };
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.post(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${this.config.get<string>('PHONE_ID')}/sendMessage`,
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

    public async getContactInformation(id: string) {
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.get(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${this.config.get<string>('PHONE_ID')}/contact/${id}`,
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

    public async getGroupInformation(id: string) {
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.get(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${this.config.get<string>('PHONE_ID')}/getGroups/${id}`,
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

    public async getConversation(id: string) {
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.get(
                `${this.config.get<string>('INSTANCE_URL')}/${this.config.get<string>('PRODUCT_ID')}/${this.config.get<string>('PHONE_ID')}/getConversations/${id}`,
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