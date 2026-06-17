import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/service/prisma.service';
import { CreateNote, UpdateNoteById } from './dto/note.dto';
import { Prisma } from '@prisma/client';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class NoteService {
  constructor(private readonly prismaService: PrismaService) {}

  async getNotes(userId: string) {
    try {
      return await this.prismaService.note.findMany({
        where: { userId },
      });
    } catch (error) {
      throw new InternalServerErrorException('Unable to load notes. Please try again later!');
    }
  }

  async getNoteById(userId: string, id: string) {
    try {
      const note = await this.prismaService.note.findUnique({
        where: { id, userId },
      });

      if (!note) {
        throw new NotFoundException('Note not found or you do not have permission to access.');
      }

      return note;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      
      throw new InternalServerErrorException('Unable to load note by id. Please try again later!');
    }
  }

  async updateNoteById(userId: string, id: string, updateData: UpdateNoteById) {
    try {
      return await this.prismaService.note.update({
        where: { id, userId }, 
        data: updateData,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Mã P2025: Bản ghi cần update không tồn tại (hoặc sai userId nên không tìm thấy)
        if (error.code === 'P2025') {
          throw new NotFoundException('Note not found or you do not have permission to update.');
        }
        throw new BadRequestException('Invalid data for updating note.');
      }
      throw new InternalServerErrorException('Unable to update note. Please try again later!');
    }
  }

  async createNote(userId: string, createData: CreateNote) {
    try {
      return await this.prismaService.note.create({
        data: {
          ...createData,
          userId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Unable to create note. Please try again later!');
    }
  }

  async deleteNote(userId: string, id: string) {
    try {
      await this.prismaService.note.delete({
        where: { id, userId },
      });
      return { message: 'Delete note successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Mã P2025: Bản ghi cần xóa không tồn tại
        if (error.code === 'P2025') {
          throw new NotFoundException('Note not found or you do not have permission to delete.');
        }
      }
      throw new InternalServerErrorException('Unable to delete note. Please try again later!');
    }
  }
  
  //hàm render một ghi chú ra HTML, sử dụng thư viện markdown-it để chuyển đổi nội dung markdown thành HTML
  async renderNoteById(userId: string, id: string) {
    const note = await this.prismaService.note.findFirst({
      where: { id, userId },
    });
    if (!note) {
      throw new NotFoundException('Note not found or you do not have permission to access.');
    }
    //chuyển đổi mã markdown thành HTML bằng marked.parse
    const rawHtml = await marked.parse(note.content);

    //làm sạch mã HTML bằng DOMPurify để loại bỏ các thẻ và thuộc tính không an toàn
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return {
      id : note.id,
      title: note.title,
      content: cleanHtml,
    }
  }
}