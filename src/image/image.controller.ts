import { Controller, Get } from '@nestjs/common';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
    constructor(private readonly imageService: ImageService) { }

    @Get("/icon/list")
    getImage():Promise<string[]> {
        return this.imageService.getIconList();
    }
}
