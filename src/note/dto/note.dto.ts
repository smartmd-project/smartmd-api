import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateNoteById {
  @ApiPropertyOptional({
    example: 'NestJS Swagger setup',
    description: 'New note title.',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    example: '# Updated note\n\nDocumented with Swagger.',
    description: 'New Markdown content.',
  })
  @IsString()
  @IsOptional()
  content?: string;
}

export class CreateNote {
  @ApiProperty({
    example: 'My first Markdown note',
    description: 'Note title.',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '# Hello smartMD\n\nThis is a Markdown note.',
    description: 'Markdown content of the note.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CheckGrammarDto {
  @ApiProperty({
    example: 'This are a test sentence.',
    description: 'Plain text content to check with LanguageTool.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    enum: ['en', 'en-US'],
    example: 'en-US',
    default: 'en-US',
    description: 'Language code used by grammar checker.',
  })
  @IsOptional()
  @IsIn(['en', 'en-US'])
  language?: 'en' | 'en-US' = 'en-US'; // Đặt mặc định là 'en-US' ở đây luôn
}
