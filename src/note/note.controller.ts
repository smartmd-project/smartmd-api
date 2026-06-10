import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/service/prisma.service';
import { NoteService } from './note.service';

@Controller('note')
export class NoteController {
    constructor(private readonly noteService: NoteService) {}
    @Get()
    async getNotes() {
        return this.noteService.getNotes();
    }
}
