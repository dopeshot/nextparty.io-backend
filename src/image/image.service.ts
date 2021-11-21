import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ImageService {
    constructor(private readonly configService:ConfigService) { }
    async getIconList(): Promise<string[]> {
        const iconList: string[] = [];
        
        // Read all files in directory
        const fileList = fs.readdirSync(join(__dirname, "..", "..","images", "icon_presets" ))

        // Filter out all files that are not .png
        for (const file of fileList) {
            if (file.endsWith(".png")) {
                iconList.push(`${this.configService.get<string>('HOST')}/icons/presets/${file}`)
            } 
        }
    return iconList
    }
}
