import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

// Strip null bytes and control chars that can break SQL/logs; trim strings
function sanitizeValue(val: any): any {
  if (typeof val === 'string') {
    return val
      .replace(/\0/g, '')           // null bytes
      .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars except \t \n \r
      .trim();
  }
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (val !== null && typeof val === 'object') {
    return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, sanitizeValue(v)]));
  }
  return val;
}

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, _metadata: ArgumentMetadata) {
    return sanitizeValue(value);
  }
}
