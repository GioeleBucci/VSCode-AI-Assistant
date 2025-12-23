import packageJson from "../package.json";

export class Constants {
    static readonly EXTENSION_ID = packageJson.name;
    static readonly INSTRUCTION_FILE_DIRECTORY = ".ai";
    static readonly INSTRUCTION_FILE_NAME = "agentInstructions.md";
}
