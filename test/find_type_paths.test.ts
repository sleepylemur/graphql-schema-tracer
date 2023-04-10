import { findTypePaths } from "../src/find_type_paths";
import { expect } from "chai";
import { buildSchema } from "graphql";
import { readFileSync } from "node:fs";

describe("findTypePaths", () => {
  const schemaFilePath = "test/schema.graphql";
  const schemaFileContent = readFileSync(schemaFilePath, "utf-8");
  const schema = buildSchema(schemaFileContent);
  const typeMap = schema.getTypeMap() as any;

  it("should find path to itself", () => {
    const user = typeMap.User;
    expect(findTypePaths(user, user)).to.deep.equal([["User"]]);
  });

  it("should find all paths from query to user", () => {
    const result = findTypePaths(typeMap.Query, typeMap.User);
    expect(result).to.deep.equal([
      ["Query", "User"],
      ["Query", "AllPosts", "author"],
      ["Query", "Search", "User"],
    ]);
  });

  it("should find path from query to user.email", () => {
    expect(
      findTypePaths(typeMap.Query, typeMap.User.getFields().email.type)
    ).to.deep.equal([["Query", "User", "email"]]);
  });

  it("should find path from query to user.role.ADMIN", () => {
    expect(
      findTypePaths(typeMap.Query, typeMap.Role.getValues()[1])
    ).to.deep.equal([["Query", "User", "role", "ADMIN"]]);
  });
});
