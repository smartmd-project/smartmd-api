import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../common/service/prisma.service';
import { NoteService } from './note.service';
import { AccessTokenGuard } from '../common/guards/access-token.guards';

@Controller('note')
export class NoteController {
    constructor(private readonly noteService: NoteService) {}
    @Get()
    async getNotes() {
        return this.noteService.getNotes();
    }
}
