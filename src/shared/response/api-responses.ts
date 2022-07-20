import { HttpStatus } from '@nestjs/common';

export const apiResponseBadRequest = {
    status: HttpStatus.BAD_REQUEST,
    type: null,
    description: 'Bad Request: dto/id is not viable'
};

export const apiResponseUnauthorized = {
    status: HttpStatus.UNAUTHORIZED,
    type: null,
    description: 'Unauthorized: Jwt not valid'
};

export const apiResponseNotFound = {
    status: HttpStatus.NOT_FOUND,
    type: null,
    description:
        'Not Found: Requested ressource not found or insufficient permissions'
};
