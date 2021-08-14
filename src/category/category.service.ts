import { Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel, MongooseModule } from '@nestjs/mongoose';
import { exception } from 'console';
import { Model, ObjectId, Types } from 'mongoose';
import { SetDocument, SetSchema } from 'src/set/entities/set.entity';
import { SetService } from 'src/set/set.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryDocument } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(@InjectModel('Category') private categorySchema: Model<CategoryDocument>) { }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    try {
      const category = new this.categorySchema({
        ...createCategoryDto
      })
      const result = await category.save()
      return result

    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException()
    }
  }

  async updateSets(categoryId: ObjectId, setId: ObjectId, option: string) {
    let result;
    const filter = { _id: categoryId }

    // Add Set
    if (option == "addset") {
      result = await this.categorySchema.findByIdAndUpdate(filter, { $addToSet: { set: setId } }, { returnOriginal: false }).lean()
      if (!result) { throw new NotFoundException() }
    }

    // Delete Set
    else if (option == "removeset") {
      result = await this.categorySchema.findByIdAndUpdate(filter, { $pull: { set: setId } }, { returnOriginal: false }).lean()
      if (!result) { throw new NotFoundException() }
    }

    // Not a correct option
    else { throw new UnprocessableEntityException }

    return result;
  }

  async updateMetadata(id: ObjectId, updateCategoryDto: UpdateCategoryDto) {
    const filter = { _id: id }
    const result = await this.categorySchema.findByIdAndUpdate
      (filter, updateCategoryDto, { returnOriginal: false }).lean()
    if (!result) { throw new NotFoundException }

    return result;
  }

  async findAll(): Promise<CategoryDocument[]> {
    return await this.categorySchema.find()
  }

  async findTopTenSets(id: ObjectId): Promise<SetDocument[]> {
    const idd = id.toString()
    const result = await this.categorySchema.aggregate([
      { '$match': { '_id': Types.ObjectId(idd)  } },
      {
        '$lookup': {
          'from': 'sets',
          'localField': 'set',
          'foreignField': '_id',
          'pipeline': [
            {
              '$addFields': {
                'difference': {
                  '$subtract': [
                    '$likes', '$dislikes'
                  ]
                }
              }
            }, {
              '$sort': {
                'difference': -1
              }
            }, {
              '$limit': 10
            }
          ],
          'as': 'objects'
        }
      }, {
        '$project': {
          'objects': 1
        }
      }
    ])
    if (!result) { throw new NotFoundException }
    return result
  }

  async findAllSets(id: ObjectId): Promise<SetDocument[]> {
    const idd = id.toString()
    const result = await this.categorySchema.aggregate([
      { '$match': { '_id': Types.ObjectId(idd)  } },
      {
        '$lookup': {
          'from': 'sets',
          'localField': 'set',
          'foreignField': '_id',
          'pipeline': [
            {
              '$addFields': {
                'difference': {
                  '$subtract': [
                    '$likes', '$dislikes'
                  ]
                }
              }
            }, {
              '$sort': {
                'difference': -1
              }
            }
          ],
          'as': 'objects'
        }
      }, {
        '$project': {
          'objects': 1
        }
      }
    ])
    if (!result) { throw new NotFoundException }
    return result
  }

  async findOne(id: ObjectId): Promise<CategoryDocument> {
    let category = await this.categorySchema.findById(id).lean()
    if (!category)
      throw new NotFoundException()

    return category;
  }

  async remove(id: ObjectId): Promise<void> {
    const result = await this.categorySchema.findByIdAndDelete(id)
    if (!result) { throw NotFoundException }

    return;
  }
}
