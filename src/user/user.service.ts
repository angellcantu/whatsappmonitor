'use strict';

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from './user.entity'
import { CreateUserDto, FindUserByUsernamePasswordDto } from './user.dto';
import { IUserRepository } from './user.interface';

@Injectable()
export class UserService implements IUserRepository {
    
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {}

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async create(user: CreateUserDto): Promise<User> {
        let record = this.userRepository.create(user);
        await this.userRepository.save(record);
        return record;
    }

    async findUserByUsernamePassword({ username, password }: FindUserByUsernamePasswordDto): Promise<User> {
        return this.userRepository.findOne({ where: { username: username, password: password } });
    }

}