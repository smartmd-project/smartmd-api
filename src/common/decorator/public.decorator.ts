import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';//tạo ra 1 key có tên là isPublic để lưu trữ thông tin về việc 1 route có phải là public hay ko
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
//tạo ra 1 decorator có tên là Public để đánh dấu 1 route nào đó là public, khi sử dụng decorator này thì sẽ gán giá trị true cho key isPublic