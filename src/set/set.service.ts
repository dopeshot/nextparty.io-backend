import { ConflictException, ForbiddenException, HttpCode, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { JwtUserDto } from '../auth/dto/jwt.dto';
import { Status } from '../shared/enums/status.enum';
import { SharedService } from '../shared/shared.service';
import { Role } from '../user/enums/role.enum';
import { CreateSetDto } from './dto/create-set.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateSetDto } from './dto/update-set.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { SetDocument } from './entities/set.entity';
import { TaskDocument } from './entities/task.entity';
import { ResponseSet, ResponseSetMetadata, ResponseSetWithTasks, ResponseTask, ResponseTaskWithStatus } from './types/set.response';
import { Language } from "../shared/enums/language.enum"
import { TaskType } from "./enums/tasktype.enum";
import { CurrentPlayerGender } from "./enums/currentplayergender.enum";

@Injectable()
export class SetService {
  constructor(
    @InjectModel('Set') private setSchema: Model<SetDocument>,
    @InjectModel('Task') private taskSchema: Model<TaskDocument>,
    private readonly sharedService: SharedService
  ) { }


  async createSet(createSetDto: CreateSetDto, user: JwtUserDto): Promise<ResponseSet> {
    try {

      const set: SetDocument = await this.setSchema.create({ ...createSetDto, createdBy: user.userId })

      return {
        _id: set.id,
        daresCount: set.daresCount,
        truthCount: set.truthCount,
        language: set.language,
        name: set.name,
        createdBy: {
          _id: user.userId,
          username: user.username
        }
      }

    } catch (error) {
      if (error.code = '11000') {
        throw new ConflictException('This set already exists')
      }
      console.error(error)
      throw new InternalServerErrorException()
    }
  }

  async getAllSets(): Promise<ResponseSet[]> {

    const sets: ResponseSet[] = await this.setSchema.find(
      { status: Status.ACTIVE },
      { _id: 1, daresCount: 1, truthCount: 1, name: 1, language: 1, createdBy: 1 }
    ).populate<ResponseSet[]>('createdBy', '_id username')

    if (sets.length === 0)
      throw new NotFoundException()

    return sets

  }

  async getOneSet(id: ObjectId): Promise<ResponseSetWithTasks> {

    const set: (ResponseSet & { tasks: ResponseTaskWithStatus[] }) = await this.setSchema.findOne(
      { _id: id, status: Status.ACTIVE },
      { _id: 1, daresCount: 1, truthCount: 1, name: 1, language: 1, createdBy: 1, tasks: 1 }
    ).populate<(ResponseSet & { tasks: ResponseTaskWithStatus[] })>('createdBy', '_id username').lean()

    if (!set)
      throw new NotFoundException()

    // Remove tasks from array that are not active
    const result: ResponseSetWithTasks = this.onlyActiveTasks(set)

    return result;
  }

  // Not implemented in controller
  async getOneSetMetadata(id: ObjectId): Promise<ResponseSetMetadata> {

    const set: ResponseSetMetadata = await this.setSchema.findOne(
      { _id: id, status: Status.ACTIVE },
      { _id: 1, daresCount: 1, truthCount: 1, name: 1, language: 1, createdBy: 1 }
    )

    if (!set)
      throw new NotFoundException()

    return set;
  }

  async updateSetMetadata(id: ObjectId, updateSetDto: UpdateSetDto, user: JwtUserDto): Promise<ResponseSetMetadata> {

    let queryMatch: { _id: ObjectId, createdBy?: ObjectId } = { _id: id }

    if (user.role !== Role.Admin) {
      queryMatch.createdBy = user.userId
    }

    const set: ResponseSetMetadata = await this.setSchema.findOneAndUpdate(queryMatch, updateSetDto, { new: true, select: "_id daresCount truthCount language name createdBy" })

    if (!set)
      throw new NotFoundException()

    return set

  }

  async deleteSet(id: ObjectId, deleteType: string, user: JwtUserDto): Promise<void> {

    // Hard delete
    if (deleteType === 'hard') {
      if (user.role != 'admin')
        throw new ForbiddenException()

      const set = await this.setSchema.findByIdAndDelete(id)

      if (!set)
        throw new NotFoundException()

      return

    }

    // Soft delete
    const queryMatch: { _id: ObjectId, createdBy?: ObjectId } = { _id: id }

    if (user.role !== Role.Admin)
      queryMatch.createdBy = user.userId

    const set = await this.setSchema.findOneAndUpdate(queryMatch, { status: Status.DELETED })

    if (!set)
      throw new NotFoundException()

    return

  }

  async createTask(setId: ObjectId, createTaskDto: CreateTaskDto, user: JwtUserDto): Promise<ResponseTask> {

    const task: TaskDocument = new this.taskSchema({ ...createTaskDto })
    const queryMatch: { _id: ObjectId, createdBy?: ObjectId } = { _id: setId }

    if (user.role !== Role.Admin)
      queryMatch.createdBy = user.userId

    const set: SetDocument = await this.setSchema.findOneAndUpdate(queryMatch, { $push: { tasks: task } }, { new: true })

    if (!set)
      throw new NotFoundException()

    return {
      _id: task._id,
      currentPlayerGender: task.currentPlayerGender,
      type: task.type,
      message: task.message
    }

  }

  // Depending on the updateTaskDto: message, type and currentPlayerGender are updated
  async updateTask(setId: ObjectId, taskId: ObjectId, updateTaskDto: UpdateTaskDto, user: JwtUserDto): Promise<void> {

    const queryMatch: { _id: ObjectId, 'tasks._id': ObjectId, createdBy?: ObjectId } = { _id: setId, 'tasks._id': taskId }
    if (user.role !== Role.Admin)
      queryMatch.createdBy = user.userId

    // This might not be the best practice method
    let queryUpdate = { 'tasks.$.type': updateTaskDto.type, 'tasks.$.message': updateTaskDto.message, 'tasks.$.currentPlayerGender': updateTaskDto.currentPlayerGender }

    if (!updateTaskDto.hasOwnProperty('type'))
      delete queryUpdate['tasks.$.type']

    if (!updateTaskDto.hasOwnProperty('currentPlayerGender'))
      delete queryUpdate['tasks.$.currentPlayerGender']

    if (!updateTaskDto.hasOwnProperty('message'))
      delete queryUpdate['tasks.$.message']

    const set = await this.setSchema.findOneAndUpdate(queryMatch, queryUpdate, { new: true })

    if (!set)
      throw new NotFoundException()

    return
  }

  async removeTask(setId: ObjectId, taskId: ObjectId, deleteType: string, user: JwtUserDto): Promise<void> {

    // Hard delete
    if (deleteType === 'hard') {
      if (user.role != 'admin')
        throw new ForbiddenException()

      const set = await this.setSchema.findOneAndUpdate({ _id: setId, createdBy: user.userId }, { $pull: { tasks: { _id: taskId } } })
      console.log(set)
      if (!set) {
        throw new NotFoundException
      }

      return

    }

    // Soft delete
    const queryMatch: { _id: ObjectId, 'tasks._id': ObjectId, createdBy?: ObjectId } = { _id: setId, 'tasks._id': taskId }
    if (user.role !== Role.Admin)
      queryMatch.createdBy = user.userId

    const set = await this.setSchema.findOneAndUpdate(queryMatch, { 'tasks.$.status': Status.DELETED })

    if (!set)
      throw new NotFoundException()

    return

  }


  /*------------------------------------\
  |               Helpers               |
  \------------------------------------*/


  private onlyActiveTasks(set: (ResponseSet & { tasks: ResponseTaskWithStatus[] })): ResponseSetWithTasks {

    const reducedTasks: ResponseTask[] = [];

    // Iterate over the tasks array and only push those that are active
    set.tasks.forEach((task) => {
      if (task.status === Status.ACTIVE) {
        reducedTasks.push({
          currentPlayerGender: task.currentPlayerGender,
          _id: task._id,
          type: task.type,
          message: task.message
        })
      }
    })

    // Remove the old tasks array to reduce lines needed in the return statement (This may also improve performance by chance)
    delete set.tasks

    return {
      ...set,
      tasks: reducedTasks
    }
  }


  // Migrations / Seeder

  public async createExampleSets(user: JwtUserDto) {
    const sampleData = [{
      name: "Klassisch",
      language: Language.DE,
      tasks: [{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Setz dich für 1 Runde auf den Schoß von @a"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Erzähle einen lustigen Witz"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Tanz wie ein Roboter"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Nimm @a Huckepack"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Setze dich zwei Runden lang auf den Schoß von @a"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Einmal aussetzen"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Sprich für 2 Runden mit einem italienischen Akzent"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Ahme deine Mutter nach"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Iss einen Löffel Mayo oder 2 Löffel Ketchup"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Mach ein lustiges Gesicht"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Frisiere deine Haare mittig auf dem Kopf zu einer Palme"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Erfinde einen schnellen Tanz und bring ihn allen im Raum bei"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Nimm eine Handvoll Kekse in den Mund und versuche zu pfeifen"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Mache 10 Liegestütze oder 20 Sit-Ups"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Trage roten Lippenstift auf und küsse @a"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Kopiere für eine Runde alle Gesten von @a"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Halte Händchen mit @a"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Imitiere 2 Runden lang einen britischen Akzent"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Trink ein Glas Wasser... wie eine Katze"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Mache 5 Purzelbäume"
      }, {
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Flüstere für 2 Runden"
      }]
    }, {
      name: "Versaut",
      language: Language.DE,
      tasks: [{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Iss ein Stück von etwas (z.B Schlagsahne) von @a's Pobacke"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.FEMALE,
        message: "Präsentiere, wie du eine einen Mann anmachen würdest"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.MALE,
        message: "Präsentiere, wie du eine Frau anmachen würdest"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.MALE,
        message: "Streichle @m seine Wange, dann seine Hand, dann seinen Nacken"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.FEMALE,
        message: "Mach bis zur nächsten Runde mit @m"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.MALE,
        message: "Mach bis zur nächsten Runde mit @f"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.MALE,
        message: "Verpasse @f einen Knutschfleck"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.FEMALE,
        message: "Verpasse @m einen Knutschfleck"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.MALE,
        message: "Massiere die Brüste von @f mit Öl"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.FEMALE,
        message: "Massiere die Brust von @m mit Öl"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Mache @a einen Fake-Antrag"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Mach eine kurze Werbung für Kondome! Wenn du magst, kannst du es auch filmen"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.FEMALE,
        message: "Mach ein Selfie, wo du mit @m rummachst"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.MALE,
        message: "Mach ein Selfie, wo du mit @f rummachst"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Erzähle von deinem Lieblings-Sexspielzeug"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Küsse den unteren Bauch von @a"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.FEMALE,
        message: "Tausche alle Klamotten (einschließlich Unterwäsche) mit @m"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.MALE,
        message: "Tausche alle Klamotten (einschließlich Unterwäsche) mit @f"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Stöhne sinnlich und turne damit @a an"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.FEMALE,
        message: "Ziehe @m bis zu seiner Unterwäsche aus"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.MALE,
        message: "Ziehe @f bis zu seiner Unterwäsche aus"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Singe deinem Partner/Schwarm ein Ständchen"
      }]
    }, {
      name: "HdM Stuttgart Edition",
      language: Language.DE,
      tasks: [{
        type: TaskType.TRUTH,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Was ist das krasseste was du in der HdM gemacht hast? Erzähle."
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Gehe in die Lernwelt und fange an laut zu husten."
      },{
        type: TaskType.TRUTH,
        currentPlayerGender: CurrentPlayerGender.FEMALE,
        message: "Mit welchem Professor/Mitarbeiter würdest du eine Romanze anfangen?"
      },{
        type: TaskType.TRUTH,
        currentPlayerGender: CurrentPlayerGender.MALE,
        message: "Mit welcher Professorin/Mitarbeiterin würdest du eine Romanze anfangen?"
      }]
    }, {
      name: "Sex",
      language: Language.DE,
      tasks: [{
        type: TaskType.TRUTH,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Wo würdest du gerne einmal Sex haben?"
      },{
        type: TaskType.TRUTH,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Erzähle von deiner Beziehung/Liebe vor @a"
      },{
        type: TaskType.TRUTH,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "In wen warst du in deinem Leben verliebt?"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Lecke mit deiner Zunge über die Lippen von @a"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.FEMALE,
        message: "Verführe @m mit einem Blowjob"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Schaue @a eine Minuten lang in die Augen"
      },{
        type: TaskType.DARE,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "Gib @a eine romantische Rückenmassage"
      },{
        type: TaskType.TRUTH,
        currentPlayerGender: CurrentPlayerGender.ANYONE,
        message: "DAS IST DIE BESTE WAHRHEIT ODER PFLICHT APP DIE ICH JE GESEHEN HABE!!!!"
      },]
    }]

    sampleData.forEach(async (setData) => {
      const set = await this.createSet({
        name: setData.name,
        language: setData.language
      }, user)
      setData.tasks.forEach(async (task) => {
        await this.createTask(set._id, {
          type: task.type,
          currentPlayerGender: task.currentPlayerGender,
          message: task.message
        }, user)
      })
    })

    return {
      status: 201,
      message: "Sample data created"
    }
  }
}