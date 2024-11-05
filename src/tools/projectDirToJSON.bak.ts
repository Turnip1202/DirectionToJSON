import { Dirent } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { 
    IJsonFormatConfig, 
    IJsonDataConfig, 
    IJsonDataType,
    TProjectJSONData,
    TFilesInfoJSONType, 
    TGenerateProjectJSONDataWriteFileType, 
    IJsonDataConfigExtra 
} from "../types";
import { ErrorMessages, CustomError } from '../enums';

const jsonFormat = ({ value, replacer = null, space = 4 }: IJsonFormatConfig) => JSON.stringify(value, replacer, space);

export const generateProjectJSONDataConsole: TProjectJSONData = async (projectPath: string, config?: IJsonDataConfig, extraConfig?: IJsonDataConfigExtra) => {
    if (!path.isAbsolute(projectPath)) {
        throw new CustomError(ErrorMessages.PathMustBeAbsolute);
    }
    const defaultConfig: IJsonDataConfig = {
        paths: [],
        tags: [],
        enabled: true
    };
    try {
        const directoryEntries = await fs.readdir(projectPath, { withFileTypes: true });
        const directories = directoryEntries.filter((file: Dirent) => file.isDirectory());
        const jsonData = await filesInfoJSON(directories, {...defaultConfig,...config });
        const arrData = JSON.parse(jsonData);
        if (config?.enabled && extraConfig && extraConfig.filterDirNames) {
            return jsonFormat({ value: arrData.filter((item: IJsonDataType) =>!extraConfig.filterDirNames.includes(item.name)) });
        } else {
            return jsonData;
        }
    } catch (error) {
        throw new CustomError(`${ErrorMessages.ReadDirectoryError} ${error.message}`);
    }
};

const filesInfoJSON: TFilesInfoJSONType = async (directoryEntries: Dirent[], config: IJsonDataConfig) => {
    return jsonFormat({
        value: directoryEntries.map((file: Dirent) => ({
            name: file.name,
            rootPath: path.join(file.parentPath, file.name),
           ...config
        }))
    });
};

export const generateProjectJSONDatawriteFile: TGenerateProjectJSONDataWriteFileType = async (projectPath: string, outFilePath?: string, config?: IJsonDataConfig, extraConfig?: IJsonDataConfigExtra) => {
    try {
        const data = await generateProjectJSONDataConsole(projectPath, config, extraConfig);
        await fs.writeFile(path.join(outFilePath?? projectPath, `${extraConfig?.fileName}.json`), data, { encoding: "utf-8" });
        return data;
    } catch (error) {
        throw new CustomError(`${ErrorMessages.WriteFileError} ${error.message}`);
    }
};

export default { generateProjectJSONDataConsole, generateProjectJSONDatawriteFile };