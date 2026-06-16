import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseInterceptors,
} from "@nestjs/common";
import { type Request } from "express";
import { NoteService } from "./note.service";
import {
  CreateNoteResponseDto,
  DeleteNoteResponseDto,
  GetNoteResponseDto,
} from "./dto/note-response.dto";
import { type TokenPayload } from "../common/types/jwt.type";
import { CreateNote, UpdateNoteById } from "./dto/note.dto";

@UseInterceptors(ClassSerializerInterceptor)
@Controller("note")
export class NoteController {
  constructor(private readonly noteService: NoteService) {}
  //lấy danh sách các ghi chú của user
  @Get()
  async getNotes(@Req() req: Request & { user: TokenPayload }) {
    return (await this.noteService.getNotes(req.user.userId)).map(
      (note) => new GetNoteResponseDto(note),
    );
  }
  //lấy ra một ghi chú của user dựa vào id
  @Get(":id")
  async getNoteById(
    @Req() req: Request & { user: TokenPayload },
    @Param("id") id: string,
  ) {
    const note = await this.noteService.getNoteById(req.user.userId, id);
    return new GetNoteResponseDto(note);
  }
  //cập nhật ghi chú
  @Patch(":id")
  async updateNoteById(
    @Req() req: Request & { user: TokenPayload },
    @Param("id") id: string,
    @Body() updateData: UpdateNoteById,
  ) {
    const updatedNote = await this.noteService.updateNoteById(
      req.user.userId,
      id,
      updateData,
    );
    return new GetNoteResponseDto(updatedNote);
  }
  @Post()
  async createNote(
    @Req() req: Request & { user: TokenPayload },
    @Body() createData: CreateNote,
  ) {
    const note = await this.noteService.createNote(req.user.userId, createData);
    return new CreateNoteResponseDto({ message: "Note created successfully" });
  }
  @Delete(":id")
  async deleteNoteById(
    @Req() req: Request & { user: TokenPayload },
    @Param("id") id: string,
  ) {
    await this.noteService.deleteNote(req.user.userId, id);
    return new DeleteNoteResponseDto({ message: "Note deleted successfully" });
  }
}
