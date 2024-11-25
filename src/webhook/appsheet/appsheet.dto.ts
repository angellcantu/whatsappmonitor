'use strict';

import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class AppSheetDto {

    @IsNumber()
    @IsNotEmpty({ message: `The 'id' field cannot be empty` })
    id: number;

    @IsString()
    @IsNotEmpty({ message: `The 'row_id' field cannot be empty` })
    row_id: string;

    @IsString()
    @IsNotEmpty({ message: `The 'name' field cannot be empty` })
    name: string;

    @IsString()
    @IsNotEmpty({ message: `The 'gender' field cannot be empty` })
    gender: string;

    @IsString()
    @IsNotEmpty({ message: `The 'municipality' field cannot be empty` })
    municipality: string;

    @IsString()
    @IsNotEmpty({ message: `The 'suburb' field cannot be empty` })
    suburb: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_2' field cannot be empty` })
    question_2: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_3_1' field cannot be empty` })
    question_3_1: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_3_2' field cannot be empty` })
    question_3_2: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_3_3' field cannot be empty` })
    question_3_3: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_4_1' field cannot be empty` })
    question_4_1: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_4_2' field cannot be empty` })
    question_4_2: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_4_3' field cannot be empty` })
    question_4_3: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_4_4' field cannot be empty` })
    question_4_4: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_4_5' field cannot be empty` })
    question_4_5: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_4_6' field cannot be empty` })
    question_4_6: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_4_7' field cannot be empty` })
    question_4_7: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_4_7_1' field cannot be empty` })
    question_4_7_1: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_5' field cannot be empty` })
    question_5: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_6' field cannot be empty` })
    question_6: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_6_1' field cannot be empty` })
    question_6_1: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_6_2' field cannot be empty` })
    question_6_2: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_7' field cannot be empty` })
    question_7: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_8' field cannot be empty` })
    question_8: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_8_1' field cannot be empty` })
    question_8_1: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_8_2' field cannot be empty` })
    question_8_2: string;

    @IsString()
    @IsNotEmpty({ message: `The 'question_9' field cannot be empty` })
    question_9: string;

    @IsString()
    @IsNotEmpty({ message: `The 'location' field cannot be empty` })
    location: string;

    @IsString()
    @IsNotEmpty({ message: `The 'image' field cannot be empty` })
    image: string;

    @IsString()
    @IsNotEmpty({ message: `The 'created_by_email' field cannot be empty` })
    created_by_email: string;

    @IsString()
    @IsNotEmpty({ message: `The 'created_at' field cannot be empty` })
    created_at: string;

}