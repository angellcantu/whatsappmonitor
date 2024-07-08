'use strict';

import { Controller, Post, Body, HttpException, HttpStatus } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto, FindUserByUsernamePasswordDto } from './user.dto';

@Controller('users')
export class UserController {
    
    constructor(private readonly userService: UserService) { }

    @Post()
    create(@Body() user: CreateUserDto) {
        try {
            return this.userService.create(user);
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.CONFLICT);
        }
    }

    @Post('/signin')
    async findUserByUsernamePassword(@Body() user: FindUserByUsernamePasswordDto) {
        try {
            let result = await this.userService.findUserByUsernamePassword(user);
            if (!result) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }
            return result;
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.CONFLICT);
        }
    }

}