  import { BadRequestException, Get, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
  import { PrismaService } from "../common/service/prisma.service";
  import { CreateNote, UpdateNoteById } from "./dto/note.dto";
import { Prisma } from "@prisma/client";

  @Injectable()
  export class NoteService {
    constructor(private readonly prismaService: PrismaService) {}
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
          throw new NotFoundException("Note not found or you don't have permission to view it!");
        }
        return note;
      } catch (error) {
        if(error instanceof NotFoundException){
          throw error;
        }
        throw new InternalServerErrorException(
          "Unable to load note by id. Please try again later!",
        );
      }
    }
    async updateNoteById(userId: string, id: string, updateData: UpdateNoteById) {
      try {
        //check note có tồn tại và thuộc về userId đó ko trước khi update
        await this.getNoteById(userId, id);
        const updatedNote = await this.prismaService.note.update({
          where: {
            id
          },
          data: updateData,
        });
        return updatedNote;
      } catch (error) {
        if(error instanceof NotFoundException){
          throw error;
        }
        if(error instanceof Prisma.PrismaClientKnownRequestError){
          throw new BadRequestException("Invalid data or note updating restriction.");
        }
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
    async deleteNote(userId: string, id: string) {
      try {
        await this.prismaService.note.delete({
          where: {
            id
          },
        });
        return { message: "Delete note successfully" };
      } catch (error) {
        if (error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException(
          "Unable to delete note. Please try again later!",
        );
      }
    }
  }
