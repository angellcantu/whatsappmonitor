'use strict';

import { Surveys } from './appsheet.entity';
import { AppSheetDto } from './appsheet.dto';

export interface IAppSheetRepository {

    create(survey: AppSheetDto): Promise<Surveys>

}