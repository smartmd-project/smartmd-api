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
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
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

@ApiTags('Notes')
@ApiCookieAuth('access_token')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  //lấy danh sách các ghi chú của user
  @ApiOperation({ summary: 'Get all notes of authenticated user' })
  @ApiOkResponse({
    description: 'List of notes owned by the authenticated user.',
    type: [GetNoteResponseDto],
  })
  @Get()
  async getNotes(@Req() req: Request & { user: TokenPayload }) {
    return (await this.noteService.getNotes(req.user.userId)).map(
      (note) => new GetNoteResponseDto(note),
    );
  }

  //lấy ra một ghi chú của user dựa vào id
  @ApiOperation({ summary: 'Get note by id' })
  @ApiParam({ name: 'id', example: '2f21a1c8-f767-4926-9a03-50a209ae8016' })
  @ApiOkResponse({
    description: 'Note detail.',
    type: GetNoteResponseDto,
  })
  @Get(':id')
  async getNoteById(@Req() req: Request & { user: TokenPayload }, @Param('id') id: string) {
    const note = await this.noteService.getNoteById(req.user.userId, id);
    return new GetNoteResponseDto(note);
  }

  //cập nhật ghi chú
  @ApiOperation({ summary: 'Update note by id' })
  @ApiParam({ name: 'id', example: '2f21a1c8-f767-4926-9a03-50a209ae8016' })
  @ApiOkResponse({
    description: 'Updated note.',
    type: GetNoteResponseDto,
  })
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
  @ApiOperation({ summary: 'Create a new note' })
  @ApiCreatedResponse({
    description: 'Note created successfully.',
    type: CreateNoteResponseDto,
  })
  @Post()
  async createNote(@Req() req: Request & { user: TokenPayload }, @Body() createData: CreateNote) {
    const note = await this.noteService.createNote(req.user.userId, createData);
    return new CreateNoteResponseDto({
      id: note.id,
      title: note.title,
      content: note.content,
      message: 'Note created successfully',
    });
  }

  //xóa một ghi chú
  @ApiOperation({ summary: 'Delete note by id' })
  @ApiParam({ name: 'id', example: '2f21a1c8-f767-4926-9a03-50a209ae8016' })
  @ApiOkResponse({
    description: 'Note deleted successfully.',
    type: DeleteNoteResponseDto,
  })
  @Delete(':id')
  async deleteNoteById(@Req() req: Request & { user: TokenPayload }, @Param('id') id: string) {
    await this.noteService.deleteNote(req.user.userId, id);
    return new DeleteNoteResponseDto({ message: 'Note deleted successfully' });
  }

  //render một ghi chú ra HTML
  @ApiOperation({ summary: 'Render Markdown note content to sanitized HTML' })
  @ApiParam({ name: 'id', example: '2f21a1c8-f767-4926-9a03-50a209ae8016' })
  @ApiOkResponse({
    description: 'Rendered sanitized HTML content.',
    type: RenderNoteResponseDto,
  })
  @Get('render/:id')
  async renderNoteById(@Req() req: Request & { user: TokenPayload }, @Param('id') id: string) {
    const { userId } = req.user;
    const contentRender = await this.noteService.renderNoteById(userId, id);
    return new RenderNoteResponseDto(contentRender);
  }

  //check ngữ pháp nội dung ghi chú
  @ApiOperation({ summary: 'Check grammar for text content' })
  @ApiOkResponse({
    description: 'Grammar checking result.',
    type: CheckGrammarResponseDto,
  })
  @Post('check-grammar')
  async checkGrammar(@Body() body: CheckGrammarDto) {
    const result = await this.noteService.checkGrammar(body.content, body.language);
    return new CheckGrammarResponseDto(result);
  }

  @ApiOperation({ summary: 'Import Markdown file and return its content' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Markdown file (.md or text/markdown).',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: 'Imported Markdown file content.',
    type: ImportFileResponseDto,
  })
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  // bộ lọc chuyển đổi file được tải lên thành một đối tượng có thể sử dụng trong phương thức
  async importMarkdownFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.noteService.importMarkdownFile(file);
    return new ImportFileResponseDto(result);
  }
}
