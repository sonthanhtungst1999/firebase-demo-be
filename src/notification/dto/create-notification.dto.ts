export class CreateNotificationDto {}

export class NotificationDto {
  isActive: boolean;
  notificationToken: string;
  device_type: string;
}

export class RegistrationIdsDto {
  registration_ids: string[];
}

export class HandleGroupOfDeviceDto {
  groupName: string;
  device_type: string;
  registration_ids: string[];
}
