import { Dirent } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { 
    IJsonFormatConfig, 
    IJsonDataConfig, 
    IJsonDataType,
    // TProjectJSONData,
    // TFilesInfoJSONType, 
    TGenerateProjectJSONDataWriteFileType, 
    IJsonDataConfigExtra 
} from "../types";
import { defaultExtraConfig } from "../configs";
import { ErrorMessages, CustomError } from '../enums';

// 将对象转换为 JSON 字符串的函数，接受一个配置对象，可指定要转换的对象、替换函数和缩进空格数
const jsonFormat = ({ value, replacer = null, space = 4 }: IJsonFormatConfig) => JSON.stringify(value, replacer, space);

// 装饰器函数，用于处理函数执行过程中的错误
function handleErrors(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        try {
            // 调用原始方法，如果成功则返回结果
            return await originalMethod.apply(this, args);
        } catch (error) {
            // 如果出现错误，抛出包含特定错误信息的自定义错误
            throw new CustomError(`${ErrorMessages[propertyKey]} ${error.message}`);
        }
    };
    return descriptor;
}

// JsonDataGenerator 类，用于生成 JSON 数据和写入文件
export class JsonDataGenerator {
    // 静态方法，用于生成项目路径下的 JSON 数据并进行过滤，接受项目路径、配置对象和额外配置对象作为参数
    @handleErrors
    static async generateProjectJSONDataConsole(projectPath: string, config?: IJsonDataConfig, extraConfig?: IJsonDataConfigExtra) {
        // 检查项目路径是否为绝对路径，如果不是则抛出错误
        if (!path.isAbsolute(projectPath)) {
            throw new CustomError(ErrorMessages.PathMustBeAbsolute);
        }
        // 默认配置对象
        const defaultConfig: IJsonDataConfig = {
            paths: [],
            tags: [],
            enabled: true
        };
        // 读取项目路径下的文件和文件夹信息
        const directoryEntries = await fs.readdir(projectPath, { withFileTypes: true });
        // 过滤出文件夹信息
        const directories = directoryEntries.filter((file: Dirent) => file.isDirectory());
        // 合并默认配置和传入的配置对象，生成 JSON 数据
        const jsonData = await JsonDataGenerator.filesInfoJSON(directories, {...defaultConfig,...config });
        const arrData = JSON.parse(jsonData);
        // 如果配置对象中的 enabled 为 true，并且有额外配置对象且包含 filterDirNames，则对数据进行过滤
        if (config?.enabled && extraConfig && extraConfig.filterDirNames) {
            return jsonFormat({ value: arrData.filter((item: IJsonDataType) =>!extraConfig.filterDirNames.includes(item.name)) });
        } else {
            // 否则直接返回原始 JSON 数据
            return jsonData;
        }
    }
    // 静态方法，将文件夹列表转换为 JSON 数据，接受文件夹列表和配置对象作为参数
    static async filesInfoJSON(directoryEntries: Dirent[], config: IJsonDataConfig) {
        return jsonFormat({
            value: directoryEntries.map((file: Dirent) => ({
                name: file.name,
                rootPath: path.join(file.parentPath, file.name),
              ...config
            }))
        });
    }
}


// 函数，用于将项目路径下的文件目录转换为指定的 JSON 数据并写入文件
export const generateProjectJSONDatawriteFile: TGenerateProjectJSONDataWriteFileType = async (projectPath: string, outFilePath?: string, config?: IJsonDataConfig, extraConfig?: IJsonDataConfigExtra) => {
    try {
        // 调用 generateProjectJSONDataConsole 方法生成 JSON 数据，如果没有额外配置则使用默认配置
        const data = await JsonDataGenerator.generateProjectJSONDataConsole(projectPath, config, extraConfig?? defaultExtraConfig);
        // 写入文件，如果没有指定输出路径，则使用项目路径，并使用额外配置中的文件名或默认文件名
        await fs.writeFile(path.join(outFilePath?? projectPath, `${extraConfig?.fileName?? defaultExtraConfig.fileName}.json`), data, { encoding: "utf-8" });
        // 返回生成的 JSON 数据
        return data;
    } catch (error) {
        // 如果写入文件时出现错误，抛出包含特定错误信息的自定义错误
        throw new CustomError(`${ErrorMessages.WriteFileError} ${error.message}`);
    }
};