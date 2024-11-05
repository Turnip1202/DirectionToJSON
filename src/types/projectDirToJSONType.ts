// 导入 node:fs 模块中的 Dirent 类型
import { Dirent } from "node:fs";


// 定义 JSON 格式化配置接口
export interface IJsonFormatConfig {
    value: any;
    replacer?: (this: any, key: string, value: any) => any;
    space?: string | number;
}

// 定义 JSON 数据配置接口
export interface IJsonDataConfig {
    paths: string[];
    tags: string[];
    enabled: boolean;
}

// 定义 JSON 数据类型接口，继承自 JSON 数据配置接口
export interface IJsonDataType extends IJsonDataConfig {
    name: string;
    rootPath: string;
}

// 定义项目 JSON 数据生成函数类型，接受项目路径和可选的配置对象，返回 Promise<string>
export type TProjectJSONData = (ProjectPath: string, config?: IJsonDataConfig,extraConfig?:IJsonDataConfigExtra) => Promise<string>;

// 定义文件转换为 JSON 数据函数类型
export type TFilesInfoJSONType = (directoryEntries: Dirent[], config: IJsonDataConfig) => Promise<string>;

// 定义生成项目 JSON 数据并写入文件的函数类型，接受项目路径、可选的输出文件路径、可选的配置对象和额外配置对象，返回 Promise<string>
export type TGenerateProjectJSONDataWriteFileType = (projectPath: string, outFilePath?: string, config?: IJsonDataConfig, extraConfig?: IJsonDataConfigExtra) => Promise<string>;

// 额外配置接口
export interface IJsonDataConfigExtra {
    fileName?: string;
    filterDirNames?: string[];
}