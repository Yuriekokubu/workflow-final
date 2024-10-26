import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidationArguments } from "class-validator";

const isNumberMesssage = (validationArguments: ValidationArguments): string => {
    return `${validationArguments.property}: ต้องเป็นตัวเลข`;
}

export class CreateItemDto {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber({}, { message: isNumberMesssage })
    @IsNotEmpty()
    amount: number;

    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @IsOptional()
    createdAt?: Date;

    @IsOptional()
    updatedAt?: Date;
}
