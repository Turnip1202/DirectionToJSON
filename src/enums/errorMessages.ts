// 定义错误信息枚举
export enum ErrorMessages {
    PathMustBeAbsolute = 'Project path must be an absolute path.',
    ReadDirectoryError = 'Error reading directory:',
    WriteFileError = 'Error writing file:'
}

// 自定义错误类
export class CustomError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CustomError';
    }
}