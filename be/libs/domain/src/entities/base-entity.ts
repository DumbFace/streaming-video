import { Prop } from '@nestjs/mongoose';
export class BaseEntity {
  @Prop({ default: new Date() })
  createdAt: Date = new Date();

  @Prop({ default: new Date() })
  updateAt: Date = new Date();
}
