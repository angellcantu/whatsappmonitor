'use strict';

import { User } from './user.entity';
import { CreateUserDto, FindUserByUsernamePasswordDto } from './user.dto';

export interface IUserRepository {

    findAll(): Promise<Array<User>>;
    create(user: CreateUserDto): Promise<User>;
    findUserByUsernamePassword(user: FindUserByUsernamePasswordDto): Promise<User>;

}