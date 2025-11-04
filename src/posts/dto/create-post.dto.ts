import { IsNotEmpty } from "class-validator";

export class CreatePostDto {
    @IsNotEmpty({ message: "title không được để trống" })
    title: string;
    @IsNotEmpty({ message: "content không được để trống" })
    content: string;
}
