import { MongooseModule } from "@nestjs/mongoose";
import { seeder } from "nestjs-seeder";
import { TaskSchema } from "./task/entities/task.entity";
import { TaskSeeder } from "./task/task.seeder";

seeder({
    imports: [MongooseModule.forRoot('mongodb://localhost:27017/TruthOrDareSeeder'),
    MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }])
    ]
}).run([TaskSeeder])