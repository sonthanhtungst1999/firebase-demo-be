import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, CreateGroupOfDevicesDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import { NotificationService } from 'src/notification/notification.service';
import {
  NotificationDto,
  HandleGroupOfDeviceDto,
} from 'src/notification/dto/create-notification.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const createdUser = await this.prismaService.user.create({
      data: {
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
      },
    });

    await this.notificationService.createGroupOfDevice(
      createdUser.id.toString(),
      {
        registration_ids: [createUserDto.registration_id],
      },
    );

    await this.notificationService.acceptPushNotification(createdUser, {
      device_type: createUserDto.device_type,
      notificationToken: createUserDto.registration_id,
      isActive: true,
    });

    return createdUser;
  }

  async updateProfile(id: number, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
        },
      });

      if (updatedUser) {
        const { notification_key } =
          await this.notificationService.getGroupToken(
            updatedUser.id.toString(),
          );
        this.notificationService
          .updateProfileSend(notification_key)
          .catch((e) => {
            console.log('Error sending push notification', e);
          });
      }
      return updatedUser;
    } catch (err) {
      throw err;
    }
  }

  async enablePush(userId, notificationDto: NotificationDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    return await this.notificationService.acceptPushNotification(
      user,
      notificationDto,
    );
  }

  async disablePush(userId, notificationDto: NotificationDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    return await this.notificationService.disablePushNotification(
      user,
      notificationDto,
    );
  }

  async getPushNotifications() {
    return await this.notificationService.getNotifications();
  }

  async createUserGroupOfDevices(
    id: number,
    createDto: CreateGroupOfDevicesDto,
  ) {
    const user = await this.prismaService.user.findFirst({
      where: {
        id,
      },
    });
    if (!user) {
      throw new BadRequestException(`User ${id} does not exist`);
    }

    return await this.notificationService.createGroupOfDevice(
      id.toString(),
      createDto,
    );
  }

  async getGroupTokenByGroupName(groupName: string) {
    return await this.notificationService.getGroupToken(groupName);
  }

  async sendToSingleToken(token: string) {
    return await this.notificationService.sendToSingleToken(token);
  }

  async addDeviceToGroup(dto: HandleGroupOfDeviceDto) {
    return await this.notificationService.addDeviceToGroup(dto);
  }

  async removeDeviceOfGroup(dto: HandleGroupOfDeviceDto) {
    return await this.notificationService.removeDeviceOfGroup(dto);
  }

  async subscribeTopic() {
    return await this.notificationService.subscribeTopic();
  }

  async unsubscribeTopic() {
    return await this.notificationService.unsubscribeTopic();
  }

  async publishToPic() {
    return await this.notificationService.publishToTopic();
  }
}
