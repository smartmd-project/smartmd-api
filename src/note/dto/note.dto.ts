import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateNoteById {
  @IsString()
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  content?: string;
}

export class CreateNote {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class CheckGrammarDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsIn(['en', 'en-US'])
  language?: 'en' | 'en-US' = 'en-US'; // Đặt mặc định là 'en-US' ở đây luôn
}