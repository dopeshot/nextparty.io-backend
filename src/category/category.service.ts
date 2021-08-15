import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { PaginationPayload } from '../shared/interfaces/paginationPayload.interface';
import { Set, SetDocument } from '../set/entities/set.entity';
import { SharedService } from '../shared/shared.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './entities/category.entity';
import { CategoryStatus } from './enums/categoryStatus.enum';

@Injectable()
export class CategoryService {
	constructor(@InjectModel('Category') private categorySchema: Model<CategoryDocument>,
		private readonly sharedService: SharedService) { }

	async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
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

	async updateSets(categoryId: ObjectId, setId: ObjectId, action: string): Promise<Category> {
		let result;
		const filter = { _id: categoryId }

		// Add Set
		if (action === "add") {
			result = await this.categorySchema.findByIdAndUpdate(filter, { $addToSet: { set: setId } }, { returnOriginal: false })
		}

		// Remove Set
		else if (action === "remove") {
			result = await this.categorySchema.findByIdAndUpdate(filter, { $pull: { set: setId } }, { returnOriginal: false })
		}

		// Not a correct option
		else throw new BadRequestException()

		if (!result) throw new NotFoundException()

		return result
	}

	async updateMetadata(id: ObjectId, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
		const result = await this.categorySchema.findByIdAndUpdate(id, updateCategoryDto, { new: true })
		if (!result) throw new NotFoundException() 

		return result;
	}

	async findAll(page: number, limit: number): Promise<PaginationPayload<Category>> {
		const documentCount = await this.categorySchema.estimatedDocumentCount()
		const categories: Category[] = await this.categorySchema.find().limit(limit).skip(limit * page)

		return this.sharedService.createPayloadWithPagination(documentCount, page, limit, categories)
	}

	async findTopTenSets(id: ObjectId): Promise<Set[]> {
		const idAsString = id.toString()
		const result = await this.categorySchema.aggregate([
			{ '$match': { '_id': Types.ObjectId(idAsString) } },
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
								'difference': -1, '_id': 1
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
		if (!result) { throw new NotFoundException() }
		return result
	}

	async findAllSets(id: ObjectId, page: number, limit: number): Promise<PaginationPayload<Category>> {
		const skip = page * limit
		limit += skip
		//TODO: Is that correct? Why 'limit += skip'? If you use mongoose you can do limit(limit).skip(limit * page) 

		const idAsString = id.toString()
		const documentCount = await this.categorySchema.estimatedDocumentCount()
		const result = await this.categorySchema.aggregate([
			{ '$match': { '_id': Types.ObjectId(idAsString) } },
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
								'difference': -1, '_id': 1
							}
						}, {
							'$limit': limit
						}, {
							'$skip': skip
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
		if (result.length == 0) { throw new NotFoundException() }
		return this.sharedService.createPayloadWithPagination(documentCount, page, limit, result)
	}

	async findOne(id: ObjectId): Promise<Category> {
		// TODO: Add populate here
		const category = await this.categorySchema.findById(id)
		if (!category)
			throw new NotFoundException()

		return category;
	}

	async remove(id: ObjectId, type: string): Promise<void> {
		const isHardDelete = type ? type.includes('hard') : false

		let category
		// true is for admin check later
		if (true && isHardDelete)
			category = await this.categorySchema.findByIdAndDelete(id)
		else
			category = await this.categorySchema.findByIdAndUpdate(id, {
				status: CategoryStatus.DELETED
			}, {
				new: true
			})

		if (!category) throw new NotFoundException()
	}
}
