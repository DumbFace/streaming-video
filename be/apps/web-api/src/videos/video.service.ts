/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Video } from './entities/video';
import { Model } from 'mongoose';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel(Video.name) private readonly videoSchema: Model<Video>,
  ) {}

  async create(
    data: Partial<Video>,
    file: Express.Multer.File,
  ): Promise<Video> {
    data.directory = file.path;

    return new this.videoSchema(data).save();
  }

  async findById(id: string): Promise<Video | null> {
    return this.videoSchema.findById(id).exec();
  }

  async findAll(): Promise<Video[]> {
    return this.videoSchema.find().exec();
  }

  async update(id: string, data: Partial<Video>): Promise<Video | null> {
    return this.videoSchema.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    return !!this.videoSchema.findByIdAndDelete(id).exec();
  }
}
