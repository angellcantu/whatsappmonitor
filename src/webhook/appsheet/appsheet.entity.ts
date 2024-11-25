'use strict';

import { Entity, Column } from 'typeorm';

@Entity({
    schema: 'appsheet',
    name: 'surveys'
})
export class Surveys {

    @Column({
        name: 'id',
        type: 'int',
        generated: true,
        primary: true,
        nullable: false
    })
    id?: number;

    @Column({
        name: 'appsheet_id',
        type: 'int',
        nullable: false
    })
    appSheetId: number;

    @Column({
        name: 'appsheet_row_id',
        type: 'nvarchar',
        length: 100,
        nullable: false
    })
    appSheetRowId: string;

    @Column({
        name: 'name',
        type: 'nvarchar',
        length: 100,
        nullable: false
    })
    name: string;

    @Column({
        name: 'gender',
        type: 'nvarchar',
        length: 20,
        nullable: true
    })
    gender: string;

    @Column({
        name: 'municipality',
        type: 'nvarchar',
        length: 50,
        nullable: true
    })
    municipality: string;

    @Column({
        name: 'suburb',
        type: 'nvarchar',
        length: 150,
        nullable: true
    })
    suburb: string;

    @Column({
        name: 'question_2',
        type: 'nvarchar',
        length: 10
    })
    question2: string;

    @Column({
        name: 'question_3_1',
        type: 'int',
        nullable: true
    })
    question3_1: number;

    @Column({
        name: 'question_3_2',
        type: 'int',
        nullable: false
    })
    question3_2: number;

    @Column({
        name: 'question_3_3',
        type: 'int',
        nullable: false
    })
    question3_3: number;

    @Column({
        name: 'question_4_1',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question4_1: string;

    @Column({
        name: 'question_4_2',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question4_2: string;

    @Column({
        name: 'question_4_3',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question4_3: string;

    @Column({
        name: 'question_4_4',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question4_4: string;

    @Column({
        name: 'question_4_5',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question4_5: string;

    @Column({
        name: 'question_4_6',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question4_6: string;

    @Column({
        name: 'question_4_7',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question4_7: string;

    @Column({
        name: 'question_4_7_1',
        type: 'nvarchar',
        length: 100,
        nullable: false
    })
    question4_7_1: string;

    @Column({
        name: 'question_5',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question5: string;

    @Column({
        name: 'question_6',
        type: 'nvarchar',
        length: 50,
        nullable: false
    })
    question6: string;

    @Column({
        name: 'question_6_1',
        type: 'nvarchar',
        length: 70,
        nullable: false
    })
    question6_1: string;

    @Column({
        name: 'question_6_2',
        type: 'nvarchar',
        length: 70,
        nullable: false
    })
    question6_2: string;

    @Column({
        name: 'question_7',
        type: 'nvarchar',
        length: 500,
        nullable: false
    })
    question7: string;

    @Column({
        name: 'question_8',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question8: string;

    @Column({
        name: 'question_8_1',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question8_1: string;

    @Column({
        name: 'question_8_2',
        type: 'nvarchar',
        length: 10,
        nullable: false
    })
    question8_2: string;

    @Column({
        name: 'question_9',
        type: 'nvarchar',
        length: 50,
        nullable: false
    })
    question9: string;

    @Column({
        name: 'latitude',
        type: 'float',
        nullable: false
    })
    latitude: number;

    @Column({
        name: 'longitude',
        type: 'float',
        nullable: false
    })
    longitude: number;

    @Column({
        name: 'created_by_email',
        type: 'nvarchar',
        length: 100,
        nullable: false
    })
    createdByEmail: string;

    @Column({
        name: 'created_appsheet_at',
        type: 'datetime',
        nullable: false
    })
    createdAppSheetAt: Date;

    @Column({
        name: 'image_url',
        type: 'nvarchar',
        length: 300,
        nullable: true
    })
    imageUrl: string;

    @Column({
        name: 'created_at',
        type: 'datetime',
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt?: Date;

    @Column({
        name: 'updated_at',
        type: 'datetime',
        nullable: true,
        default: () => 'CURRENT_TIMESTAMP'
    })
    updatedAt?: Date;

};