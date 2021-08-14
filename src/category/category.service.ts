import { Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { SetDocument } from 'src/set/entities/set.entity';
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

  async findTopTen(id: ObjectId): Promise<SetDocument[]> {
    
    return
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
