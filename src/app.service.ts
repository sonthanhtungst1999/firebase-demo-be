import { BadGatewayException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { HttpService } from '@nestjs/axios';
import { STATUS_CODES } from 'http';

@Injectable()
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  // async getFirebaseNoti() {
  //   return await this.prismaService.firebaseNotification.findMany({});
  // }

  // async sendToSingleDevice(deviceToken: string) {
  //   const a = "APA91bHOv_ZbuXosfCNrzevyB_nviH1LQXjtVcISBuzQ699nKrCMQ2nRBOnZCtysHw-3yysFvO5D1hi-ZTmxg9rhRiJfpGWLOcSy0iZbtV6B0rgnqLsYrPc"
  //   const data = {
  //     to: deviceToken,
  //     notification: {
  //       title: "Tung Group",
  //       body: "Join Group message"
  //     }
  //   }
  //   const accessToken = "newAccessToken";
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${accessToken}`
  //   };
  //   const myFirebaseProject = process.env.PROJECT_ID;
  //   try {
  //     const result = await this.httpService.post(
  //         `https://fcm.googleapis.com/v1/projects/${myFirebaseProject}/messages:send`, 
  //         data,
  //         { headers }
  //       );
  //     return result;
  //   } catch (err) {
  //     console.log(err);
  //     throw new HttpException('Cannot push notification!', 500);
  //   }
  // }
}
