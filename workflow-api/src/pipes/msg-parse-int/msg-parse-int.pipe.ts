// msg-parse-int.pipe.ts
import { ArgumentMetadata, BadRequestException, Injectable, ParseIntPipe } from '@nestjs/common';

@Injectable()
export class MsgParseIntPipe extends ParseIntPipe {

  paramName = ''

  constructor(private msg = 'ควรเป็นตัวเลข')  {
    super()
  }

  transform(value: any, metadata: ArgumentMetadata) {
    const { data } = metadata;
    this.paramName = data;
    return super.transform(value, metadata);
  }

  exceptionFactory = (error: any) => {
    return new BadRequestException(`${this.paramName} ${this.msg}`);
  };
}
