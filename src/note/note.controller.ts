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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { type Request } from 'express';
import { NoteService } from './note.service';
import {
  CheckGrammarResponseDto,
  CreateNoteResponseDto,
  DeleteNoteResponseDto,
  GetNoteResponseDto,
  ImportFileResponseDto,
  RenderNoteResponseDto,
} from './dto/note-response.dto';
import { type TokenPayload } from '../common/types/jwt.type';
import { CheckGrammarDto, CreateNote, UpdateNoteById } from './dto/note.dto';
import 'multer'; // Import multer for file handling
import { FileInterceptor } from '@nestjs/platform-express';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('note')
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
  @Get(':id')
  async getNoteById(@Req() req: Request & { user: TokenPayload }, @Param('id') id: string) {
    const note = await this.noteService.getNoteById(req.user.userId, id);
    return new GetNoteResponseDto(note);
  }
  
  //cập nhật ghi chú
  @Patch(':id')
  async updateNoteById(
    @Req() req: Request & { user: TokenPayload },
    @Param('id') id: string,
    @Body() updateData: UpdateNoteById,
  ) {
    const updatedNote = await this.noteService.updateNoteById(req.user.userId, id, updateData);
    return new GetNoteResponseDto(updatedNote);
  }

  //tạo mới một ghi chú
  @Post()
  async createNote(@Req() req: Request & { user: TokenPayload }, @Body() createData: CreateNote) {
    const note = await this.noteService.createNote(req.user.userId, createData);
    return new CreateNoteResponseDto({ 
      id: note.id,
      title: note.title,
      content: note.content,
      message: 'Note created successfully' 
    });
  }

  //xóa một ghi chú
  @Delete(':id')
  async deleteNoteById(@Req() req: Request & { user: TokenPayload }, @Param('id') id: string) {
    await this.noteService.deleteNote(req.user.userId, id);
    return new DeleteNoteResponseDto({ message: 'Note deleted successfully' });
  }

  //render một ghi chú ra HTML
  @Get(':id/render')
  async renderNoteById(@Req() req: Request & { user: TokenPayload }, @Param('id') id: string) {
    const {userId} = req.user;
    const contentRender = await this.noteService.renderNoteById(userId, id);
    return new RenderNoteResponseDto(contentRender);
  }

  //check ngữ pháp nội dung ghi chú
  @Post('check-grammar')
  async checkGrammar(@Body() body: CheckGrammarDto) {
    const result = await this.noteService.checkGrammar(body.content, body.language);
    return new CheckGrammarResponseDto(result);
  }

  @Post('import')

  @UseInterceptors(FileInterceptor('file')) 
  // bộ lọc chuyển đổi file được tải lên thành một đối tượng có thể sử dụng trong phương thức
  
  async importMarkdownFile(@UploadedFile() file: Express.Multer.File) {
     const result = await this.noteService.importMarkdownFile(file);
     return new ImportFileResponseDto(result);
  }
}
