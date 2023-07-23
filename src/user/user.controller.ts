import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateGroupOfDevicesDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  HandleGroupOfDeviceDto,
  NotificationDto,
  RegistrationIdsDto,
} from 'src/notification/dto/create-notification.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getGroupTokenByGroupName(@Query('notification_key_name') key: string) {
    return this.userService.getGroupTokenByGroupName(key);
  }

  @Post('/send-first-message')
  @HttpCode(HttpStatus.OK)
  sendToSingleToken(@Body() dto) {
    return this.userService.sendToSingleToken(dto.token);
  }

  @Post('/add-device')
  @HttpCode(HttpStatus.OK)
  addDevice(@Body() dto: HandleGroupOfDeviceDto) {
    return this.userService.addDeviceToGroup(dto);
  }

  @Delete('/remove-device')
  removeDevice(@Body() dto: HandleGroupOfDeviceDto) {
    return this.userService.removeDeviceOfGroup(dto);
  }

  @Post('/subscribe')
  @HttpCode(HttpStatus.OK)
  subscribe(@Body() dto: HandleGroupOfDeviceDto) {
    return this.userService.subscribeTopic();
  }

  @Post('/unsubscribe')
  @HttpCode(HttpStatus.OK)
  unsubscribe(@Body() dto: HandleGroupOfDeviceDto) {
    return this.userService.unsubscribeTopic();
  }

  @Post('/publish')
  @HttpCode(HttpStatus.OK)
  publish(@Body() dto: HandleGroupOfDeviceDto) {
    return this.userService.publishToPic();
  }

  @Post(':id/create-group')
  @HttpCode(HttpStatus.OK)
  createUserGroup(
    @Param('id') user_id: number,
    @Body() createGroupOfDevicesDto: CreateGroupOfDevicesDto,
  ) {
    return this.userService.createUserGroupOfDevices(
      +user_id,
      createGroupOfDevicesDto,
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Body() update_dto: UpdateUserDto,
    @Param('id') user_id: number,
  ) {
    return await this.userService.updateProfile(+user_id, update_dto);
  }

  @Put(':id/push/enable')
  @HttpCode(HttpStatus.OK)
  async enablePush(
    @Body() update_dto: NotificationDto,
    @Param('id') user_id: number,
  ) {
    return await this.userService.enablePush(+user_id, update_dto);
  }

  @Put('push/disable')
  @HttpCode(HttpStatus.OK)
  async disablePush(
    @Param('id') user_id: number,
    @Body() update_dto: NotificationDto,
  ) {
    return await this.userService.disablePush(user_id, update_dto);
  }

  //View all notifications
  @Get('push/notifications')
  @HttpCode(HttpStatus.OK)
  async fetchPusNotifications() {
    return await this.userService.getPushNotifications();
  }
}
