'use strict';

import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { AxiosResponse, AxiosError } from 'axios';
import { firstValueFrom, catchError } from 'rxjs';
import { Surveys } from './appsheet.entity';
import { AppSheetDto } from './appsheet.dto';
import { IAppSheetRepository } from './appsheet.interface';
import { FtpService } from '../../whatsapp/ftp.service';

@Injectable()
export class AppSheetService implements IAppSheetRepository {

    constructor(
        @InjectRepository(Surveys)
        private readonly surveyRepository: Repository<Surveys>,
        private readonly config: ConfigService,
        private readonly http: HttpService,
        private readonly ftp: FtpService
    ) {}

    private async fetchImage(url: string) {
        let { data }: AxiosResponse = await firstValueFrom(
            this.http.get(url, { responseType: 'arraybuffer' })
                .pipe(
                    catchError((error: AxiosError) => {
                        console.log(error);
                        throw new HttpException(error.message, HttpStatus.CONFLICT);
                    })
                )
        );
        return data;
    }
    
    async create(survey: AppSheetDto): Promise<Surveys> {
        try {
            const fetchImage = await this.fetchImage(survey.image);
            const name: string = `${survey.row_id}.jpg`;
            this.ftp.saveLocalFile(fetchImage, { name });
            await this.ftp.upload(`../../files/${name}`, `/img/appsheet/${name}`);
            this.ftp.removeFile(`../../files/${name}`);
            const [latitude, longitude] = survey.location.split(',');
            const _survey: Surveys = {
                appSheetId: Number(survey.id),
                appSheetRowId: survey.row_id,
                name: survey.name,
                gender: survey.gender,
                municipality: survey.municipality,
                suburb: survey.suburb,
                question2: survey.question_2,
                question3_1: Number(survey.question_3_1),
                question3_2: Number(survey.question_3_2),
                question3_3: Number(survey.question_3_3),
                question4_1: survey.question_4_1,
                question4_2: survey.question_4_2,
                question4_3: survey.question_4_3,
                question4_4: survey.question_4_4,
                question4_5: survey.question_4_5,
                question4_6: survey.question_4_6,
                question4_7: survey.question_4_7,
                question4_7_1: survey.question_4_7_1,
                question5: survey.question_5,
                question6: survey.question_6,
                question6_1: survey.question_6_1,
                question6_2: survey.question_6_2,
                question7: survey.question_7,
                question8: survey.question_8,
                question8_1: survey.question_8_1,
                question8_2: survey.question_8_2,
                question9: survey.question_9,
                latitude: Number(latitude.trim()),
                longitude: Number(longitude.trim()),
                createdByEmail: survey.created_by_email,
                createdAppSheetAt: new Date(survey.created_at),
                imageUrl: `${this.config.get<string>('WEB_APPLICATION_URL')}/img/appsheet/${name}`
            };
            let record = this.surveyRepository.create(_survey);
            await this.surveyRepository.insert(record);
            return record;
        } catch(error) {
            throw new HttpException(error.toString(), HttpStatus.CONFLICT);
        }
    }

}
