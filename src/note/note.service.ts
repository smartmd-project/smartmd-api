import { Get, Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "../common/service/prisma.service";
import { CreateNote, UpdateNoteById } from "./dto/note.dto";

@Injectable()
export class NoteService {
  constructor(private readonly prismaService: PrismaService) {}
  @Get()
  async getNotes(userId: string) {
    try {
      return await this.prismaService.note.findMany({
        where: {
          userId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Unable to load list notes. Please try again later!",
      );
    }
  }
  async getNoteById(userId: string, id: string) {
    try {
      const note = await this.prismaService.note.findUnique({
        where: {
          id,
          userId,
        },
      });
      if (!note) {
        throw new InternalServerErrorException("Note not found!");
      }
      return note;
    } catch (error) {
      throw new InternalServerErrorException(
        "Unable to load note by id. Please try again later!",
      );
    }
  }
  async updateNoteById(userId: string, id: string, updateData: UpdateNoteById) {
    try {
      const updatedNote = await this.prismaService.note.update({
        where: {
          id,
          userId,
        },
        data: updateData,
      });
      return updatedNote;
    } catch (error) {
      throw new InternalServerErrorException(
        "Unable to update note by id. Please try again later!",
      );
    }
  }
  async createNote(userId: string, createData: CreateNote) {
    try {
      const note = await this.prismaService.note.create({
        data: {
          ...createData,
          userId,
        },
      });
      return note;
    } catch (error) {
      throw new InternalServerErrorException(
        "Unable to create note. Please try again later!",
      );
    }
  }
  async deleteNode(userId: string, id: string) {
    try {
      await this.prismaService.note.delete({
        where: {
          id,
          userId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        "Unable to delete note. Please try again later!",
      );
    }
  }
}
