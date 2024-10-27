'use strict';

import { Controller, Post, Body, HttpException, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExcludeController } from '@nestjs/swagger';
import { UserService } from "./user.service";
import { CreateUserDto, FindUserByUsernamePasswordDto } from './user.dto';

@Controller('users')
@ApiTags('Users')
@ApiExcludeController()
export class UserController {
    
    constructor(private readonly userService: UserService) { }

    @Post()
    @ApiOperation({ deprecated: true })
    create(@Body() user: CreateUserDto) {
        try {
            return this.userService.create(user);
        } catch (error) {
            throw new HttpException(error.toString(), HttpStatus.CONFLICT);
        }
    }

    @Post('/signin')
    @ApiOperation({ deprecated: true })
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