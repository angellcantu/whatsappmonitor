'use strict';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'basic-ftp';
import { createReadStream, existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FtpService {

    private readonly client = new Client();
    private readonly logger = new Logger('FTP Service');

    constructor(private readonly config: ConfigService) { }

    public saveLocalFile(file: Buffer, options?: { name: string }) {
        let location: string = '../../files';
        
        if (!existsSync(join(__dirname, location))) {
            mkdirSync(join(__dirname, location));
            console.log('Here');
        }

        writeFileSync(`${join(__dirname, location)}/${options.name}`, file);
    }

    public removeFile(source: string) {
        unlinkSync(join(__dirname, source));
    }

    public async upload(source: string, remotePath: string) {
        this.client.ftp.verbose = true;
        try {
            let access = await this.client.access({
                host: this.config.get<string>('FTP_SERVER'),
                port: 21,
                user: this.config.get<string>('FTP_USER'),
                password: this.config.get<string>('FTP_PASSWORD'),
                secure: false
            });
            this.logger.log(access);
            await this.client.upload(createReadStream(join(__dirname, source)), remotePath);
            let cmd = `SITE CHMOD 755 ${remotePath}`;
            let _cmd = await this.client.send(cmd, false);
            this.logger.log(_cmd);
        } catch (error) {
            this.logger.error(error);
        } finally {
            this.client.close();
        }
    }

}