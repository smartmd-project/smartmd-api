import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../common/service/prisma.service';
import { CreateNote, UpdateNoteById } from './dto/note.dto';
import { Prisma } from '@prisma/client';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class NoteService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly languageToolUrl = 'https://api.languagetoolplus.com/v2/check';

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
      id: note.id,
      title: note.title,
      content: cleanHtml,
    };
  }

  //hàm kiểm tra ngữ pháp nội dung ghi chú qua LanguageTool
  async checkGrammar(content: string, language: 'en' | 'en-US' = 'en-US') {
    //kiểm tra nếu content rỗng hoặc chỉ chứa khoảng trắng thì trả về lỗi BadRequest
    if (!content?.trim()) {
      throw new BadRequestException('Content must not be empty.');
    }
    try {
      //đo thời gian phản hồi của API LanguageTool, nếu quá 12 giây thì tự động hủy yêu cầu và trả về lỗi timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await (async () => {
        try {
          return await fetch(this.languageToolUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              text: content,
              language,
            }),
            signal: controller.signal,
            // bộ đếm thời gian sẽ gửi tín hiệu abort nếu vượt quá thời gian quy định, 
            // giúp tránh việc chờ đợi vô tận khi API không phản hồi
          });
        } finally {
          clearTimeout(timeout);
        }
      })();

      const rawBody = await response.text();
      let data: any = null;
      try {
        data = rawBody ? JSON.parse(rawBody) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const apiMessage =
          typeof data?.message === 'string' && data.message.length > 0
            ? data.message
            : rawBody?.slice(0, 200) || 'LanguageTool API returned an error.';
        throw new ServiceUnavailableException(apiMessage);
      }

      const matches = Array.isArray(data?.matches) ? data.matches : [];

      //các lỗi lấy từ api được cấu trúc lại để trả về cho client
      const errors = matches.map((match: any) => ({
        message: match?.message ?? '',//lấy thông báo lỗi từ api, nếu không có thì trả về chuỗi rỗng

        shortMessage: match?.shortMessage ?? '',//lấy thông báo lỗi ngắn từ api, nếu không có thì trả về chuỗi rỗng

        offset: match?.offset ?? 0,//lấy vị trí bắt đầu lỗi trong chuỗi content, nếu không có thì trả về 0

        length: match?.length ?? 0,//lấy độ dài lỗi trong chuỗi content, nếu không có thì trả về 0

        context: match?.context?.text ?? '',//lấy ngữ cảnh lỗi từ api, nếu không có thì trả về chuỗi rỗng

        suggestions: Array.isArray(match?.replacements)
          ? match.replacements.map((r: any) => r.value).slice(0, 3)
          : [],//lấy các gợi ý sửa lỗi từ api, nếu không có thì trả về mảng rỗng, chỉ lấy tối đa 3 gợi ý
      }));

      return {
        originalText: content,
        totalErrors: errors.length,
        errors,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ServiceUnavailableException) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ServiceUnavailableException('LanguageTool API timeout. Please try again.');
      }

      if (error instanceof TypeError) {
        throw new ServiceUnavailableException(
          'Cannot connect to LanguageTool API. Check network/firewall and try again.',
        );
      }

      throw new InternalServerErrorException('Unable to check grammar. Please try again later!');
    }
  }
}
