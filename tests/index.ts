import { generateProjectJSONDatawriteFile,JsonDataGenerator } from "../src";
import { resolve } from "node:path";
const testPath = resolve(__dirname, "../");
console.log(testPath);

JsonDataGenerator.generateProjectJSONDataConsole(testPath).then(console.log)
generateProjectJSONDatawriteFile(testPath).then(console.log)
