import { readFile } from "node:fs/promises";
import { buildSchema } from "graphql";
import { findTypePaths } from "./find_type_paths";

export async function readSchema(filePath: string): Promise<string> {
  if (filePath === "-") {
    return new Promise((resolve, reject) => {
      let schemaStr = "";
      process.stdin.on("data", (chunk) => {
        schemaStr += chunk;
      });
      process.stdin.on("end", () => {
        resolve(schemaStr);
      });
    });
  } else {
    return readFile(filePath, "utf8");
  }
}

export async function main(args: string[]) {
  const filePath = args[0];
  const startEntityName = args[1];
  const targetEntityName = args[2];

  const schemaStr = await readSchema(filePath);

  const schema = buildSchema(schemaStr);
  const startType = schema.getType(startEntityName);
  if (!startType) {
    throw new Error(`Cannot find type ${startEntityName}`);
  }
  const targetType = schema.getType(targetEntityName);
  if (!targetType) {
    throw new Error(`Cannot find type ${targetEntityName}`);
  }

  const paths = findTypePaths(startType, targetType);
  console.log(JSON.stringify(paths));
}

if (require.main === module) {
  main(process.argv.slice(2));
}
