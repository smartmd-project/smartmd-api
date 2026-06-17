export class GetNoteResponseDto {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<GetNoteResponseDto>) {
    Object.assign(this, partial);
  }
}
export class DeleteNoteResponseDto {
  message: string;

  constructor(partial: Partial<DeleteNoteResponseDto>) {
    Object.assign(this, partial);
  }
}
export class CreateNoteResponseDto  {
  id : string;
  title : string;
  content : string;
  message: string;

  constructor(partial: Partial<CreateNoteResponseDto>) {
    Object.assign(this, partial);
  }
}

export class RenderNoteResponseDto {
  id: string;
  title: string;
  content: string;

  constructor(partial: Partial<RenderNoteResponseDto>) {
    Object.assign(this, partial);
  }
}

export class CheckGrammarResponseDto {
  originalText: string;
  totalErrors: number;
  errors: {
    message: string; // Thông báo lỗi (Ví dụ: "Phát hiện lỗi chính tả")
    offset: number; // Vị trí ký tự bắt đầu lỗi trong chuỗi
    length: number; // Độ dài của từ bị lỗi
    context: string; // Ngữ cảnh xung quanh lỗi
    suggestions: string[]; // Các gợi ý sửa lỗi
  }[];

  constructor(partial: Partial<CheckGrammarResponseDto>) {
    Object.assign(this, partial);
  }
}
