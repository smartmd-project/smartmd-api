import { ApiProperty } from '@nestjs/swagger';

export class GetNoteResponseDto {
  @ApiProperty({ example: '2f21a1c8-f767-4926-9a03-50a209ae8016' })
  id: string;

  @ApiProperty({ example: '0b637ecf-9987-4c8f-90a0-c1f098b46db9' })
  userId: string;

  @ApiProperty({ example: 'My first Markdown note' })
  title: string;

  @ApiProperty({ example: '# Hello smartMD\n\nThis is a Markdown note.' })
  content: string;

  @ApiProperty({ example: '2026-06-25T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-25T10:00:00.000Z' })
  updatedAt: Date;

  constructor(partial: Partial<GetNoteResponseDto>) {
    Object.assign(this, partial);
  }
}
export class DeleteNoteResponseDto {
  @ApiProperty({ example: 'Note deleted successfully' })
  message: string;

  constructor(partial: Partial<DeleteNoteResponseDto>) {
    Object.assign(this, partial);
  }
}
export class CreateNoteResponseDto {
  @ApiProperty({ example: '2f21a1c8-f767-4926-9a03-50a209ae8016' })
  id: string;

  @ApiProperty({ example: 'My first Markdown note' })
  title: string;

  @ApiProperty({ example: '# Hello smartMD\n\nThis is a Markdown note.' })
  content: string;

  @ApiProperty({ example: 'Note created successfully' })
  message: string;

  constructor(partial: Partial<CreateNoteResponseDto>) {
    Object.assign(this, partial);
  }
}

export class RenderNoteResponseDto {
  @ApiProperty({ example: '2f21a1c8-f767-4926-9a03-50a209ae8016' })
  id: string;

  @ApiProperty({ example: 'My first Markdown note' })
  title: string;

  @ApiProperty({ example: '<h1>Hello smartMD</h1><p>This is a Markdown note.</p>' })
  content: string;

  constructor(partial: Partial<RenderNoteResponseDto>) {
    Object.assign(this, partial);
  }
}

export class GrammarErrorDto {
  @ApiProperty({ example: 'Possible agreement error.' })
  message: string;

  @ApiProperty({ example: 'Agreement' })
  shortMessage: string;

  @ApiProperty({ example: 5 })
  offset: number;

  @ApiProperty({ example: 3 })
  length: number;

  @ApiProperty({ example: 'This are a test sentence.' })
  context: string;

  @ApiProperty({ example: ['is'], type: [String] })
  suggestions: string[];
}

export class CheckGrammarResponseDto {
  @ApiProperty({ example: 'This are a test sentence.' })
  originalText: string;

  @ApiProperty({ example: 1 })
  totalErrors: number;

  @ApiProperty({ type: [GrammarErrorDto] })
  errors: GrammarErrorDto[];

  constructor(partial: Partial<CheckGrammarResponseDto>) {
    Object.assign(this, partial);
  }
}
export class ImportFileResponseDto {
  @ApiProperty({ example: 'README.md' })
  fileName: string;

  @ApiProperty({ example: '# Imported Markdown\n\nContent from uploaded file.' })
  content: string;

  constructor(partial: Partial<ImportFileResponseDto>) {
    Object.assign(this, partial);
  }
}
