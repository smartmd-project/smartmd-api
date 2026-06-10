import { Get, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/service/prisma.service';

@Injectable()
export class NoteService {
        constructor(private readonly prismaService: PrismaService) {}
        @Get()
        async getNotes() {
           try {
                return await this.prismaService.note.findMany();
           } catch (error) {
                console.error('Error fetching notes:', error);
                throw error;
           }
        }
}
