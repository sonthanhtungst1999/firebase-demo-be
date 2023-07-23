export class CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  registration_id: string;
  device_type: string;
}

export class CreateGroupOfDevicesDto {
  registration_ids: string[];
}
