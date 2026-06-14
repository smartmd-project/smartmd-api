export class GetNoteResponseDto {
  id: string;
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
export class CreateNoteResponseDto extends DeleteNoteResponseDto {}
