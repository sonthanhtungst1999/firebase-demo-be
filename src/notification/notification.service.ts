import { BadRequestException, Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import * as path from 'path';
import { PrismaService } from 'src/prisma.service';
import {
  HandleGroupOfDeviceDto,
  NotificationDto,
} from './dto/create-notification.dto';
import { HttpService } from '@nestjs/axios';
import { CreateGroupOfDevicesDto } from 'src/user/dto/create-user.dto';

firebase.initializeApp({
  credential: firebase.credential.cert(
    path.join(__dirname, '..', '..', 'firebase-adminsdk.json'),
  ),
});

@Injectable()
export class NotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async getGroupToken(groupName: string) {
    try {
      const result = await this.httpService.axiosRef.get(
        `${process.env.FCM_URL}/notification?notification_key_name=${groupName}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.AUTHOR_TOKEN}`,
            project_id: process.env.MESSAGING_SENDER_ID,
          },
        },
      );
      return result.data;
    } catch (err) {
      throw new BadRequestException('Firebase error!!!');
    }
  }

  async createGroupOfDevice(
    userId: string,
    createDto: CreateGroupOfDevicesDto,
  ) {
    const payload = {
      operation: 'create',
      notification_key_name: userId,
      registration_ids: createDto.registration_ids,
    };
    try {
      const result = await this.httpService.axiosRef.post(
        `${process.env.FCM_URL}/notification`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.AUTHOR_TOKEN}`,
            project_id: process.env.MESSAGING_SENDER_ID,
          },
        },
      );

      return result.data;
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Firebase error!!!');
    }
  }

  async acceptPushNotification(user, NotificationDto: NotificationDto) {
    // Update all notification of the user (device_type) to inActive
    await this.prismaService.notificationToken.updateMany({
      where: {
        userId: user.id,
        device_type: NotificationDto.device_type,
      },
      data: {
        isActive: false,
      },
    });

    // Create new user token
    return await this.prismaService.notificationToken.create({
      data: {
        device_type: NotificationDto.device_type,
        notificationToken: NotificationDto.notificationToken,
        userId: user.id,
        isActive: NotificationDto.isActive,
      },
    });
  }

  async disablePushNotification(user, UpdateNotificationDto: NotificationDto) {
    await this.prismaService.notificationToken.updateMany({
      where: {
        userId: user.id,
        device_type: UpdateNotificationDto.device_type,
      },
      data: {
        isActive: false,
      },
    });
  }

  async getNotifications() {
    return await this.prismaService.notification.findMany({});
  }

  async sendPush(user: any, title: string, body: string) {
    try {
      const notification = await this.prismaService.notificationToken.findFirst(
        {
          where: {
            userId: user.id,
            isActive: true,
          },
        },
      );
      if (notification) {
        await this.prismaService.notification.create({
          data: {
            isActive: true,
            notificationTokenId: notification.id,
            title,
            body,
          },
        });
        await firebase
          .messaging()
          .send({
            notification: {
              title,
              body,
              // imageUrl: 'https://icons.geosm.ge/checkbox-checked.svg?revision=1&color=green',
            },
            token: notification.notificationToken,
          })
          .catch((error) => {
            console.log('Firebase Error!!!');
            console.log(error);
          });
      }
    } catch (err) {
      throw err;
    }
  }

  async updateProfileSend(myToken: string) {
    await firebase.messaging().send({
      notification: {
        title: 'Profile update',
        body: 'Your Profile have been updated successfully',
      },
      token: myToken,
    });
  }

  async sendToSingleToken(myToken: string) {
    await firebase.messaging().send({
      notification: {
        title: 'Hello World',
        body: 'This is first message',
      },
      token: myToken,
    });
  }

  async addDeviceToGroup(dto: HandleGroupOfDeviceDto) {
    try {
      const { notification_key } = await this.getGroupToken(dto.groupName);
      const user = await this.prismaService.user.findFirst({
        where: {
          id: Number(dto.groupName),
        },
      });
      if (!user) return;

      const result = await this.httpService.axiosRef.post(
        `${process.env.FCM_URL}/notification`,
        {
          operation: 'add',
          notification_key_name: dto.groupName,
          notification_key,
          registration_ids: dto.registration_ids,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.AUTHOR_TOKEN}`,
            project_id: process.env.MESSAGING_SENDER_ID,
          },
        },
      );
      await this.acceptPushNotification(user, {
        device_type: dto.device_type,
        notificationToken: dto.registration_ids[0],
        isActive: true,
      });
      return result.data;
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Firebase error!!!');
    }
  }

  async removeDeviceOfGroup(dto: HandleGroupOfDeviceDto) {
    try {
      const { notification_key } = await this.getGroupToken(dto.groupName);
      const result = await this.httpService.axiosRef.post(
        `${process.env.FCM_URL}/notification`,
        {
          operation: 'remove',
          notification_key_name: dto.groupName,
          notification_key,
          registration_ids: dto.registration_ids,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${process.env.AUTHOR_TOKEN}`,
            project_id: process.env.MESSAGING_SENDER_ID,
          },
        },
      );

      return result.data;
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Firebase error!!!');
    }
  }

  async subscribeTopic() {
    try {
      const tokens = await this.prismaService.notificationToken.findMany({
        where: {
          isActive: true,
        },
      });
      if (!tokens) return;
      return await firebase.messaging().subscribeToTopic(
        tokens.map((token) => token.notificationToken),
        'ss-sai-gon',
      );
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Firebase error!!!');
    }
  }

  async unsubscribeTopic() {
    try {
      // const tokens = await this.prismaService.notificationToken.findMany({
      //   where: {
      //     isActive: true,
      //   },
      // });
      return await firebase
        .messaging()
        .unsubscribeFromTopic(
          [
            'ebNMaJOs6Tf85EOJEw_pnp:APA91bGxRX3zyjiz5gqxHIlqzRrRl6ANSPKFBzxYVMI_vnzm6bhGYw7lbYt9ebY6ZKUZZYIoocfvPo4ZPUAxVIF-Qw3jPzl7mDs4DAd0PcogVGSCg1tvGUFIHusw5SPmgR5QVQac-pDo',
          ],
          'weather',
        );
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Firebase error!!!');
    }
  }

  async publishToTopic() {
    try {
      return await firebase.messaging().sendToTopic('ss-sai-gon', {
        notification: {
          title: 'Hi SSer',
          body: `It will be raining heavily today. When you get to work, please remember to bring a raincoat.`,
        },
      });
    } catch (err) {
      console.log(err);
      throw new BadRequestException('Firebase error!!!');
    }
  }
}
