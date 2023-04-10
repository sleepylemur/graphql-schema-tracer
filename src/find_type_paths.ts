import { GraphQLNamedType, GraphQLObjectType, GraphQLType } from "graphql";

/**
 * Helper function to recursively find all paths to a given GraphQL type from another GraphQL type.
 * @param startType The starting GraphQL type to search from.
 * @param targetType The GraphQL type to search for.
 * @param visited A set of visited types to prevent infinite loops.
 * @param currentPath The current path being traversed.
 * @returns A list of paths to the targetType from the startType.
 */
function findTypePathsInner(
  startType: GraphQLType,
  targetType: GraphQLType,
  visited: Set<GraphQLType>,
  currentPath: string[]
): string[][] {
  if (startType === targetType) {
    // If the target type has been found, return a list with a single path containing the current path.
    return [currentPath];
  }

  if (visited.has(startType)) {
    return [];
  }
  visited.add(startType);

  if ("ofType" in startType && startType.ofType) {
    // If the starting type is a list or non-null type, recursively search the inner type.
    return findTypePathsInner(
      startType.ofType,
      targetType,
      visited,
      currentPath
    );
  }

  if ("getFields" in startType && startType.getFields) {
    // If the starting type is an object type, recursively search each field's type.
    let paths: string[][] = [];

    for (const field of Object.values(startType.getFields())) {
      const fieldPaths = findTypePathsInner(field.type, targetType, visited, [
        ...currentPath,
        field.name,
      ]);
      if (fieldPaths.length > 0) {
        paths = [...paths, ...fieldPaths];
      }
    }
    return paths;
  }

  if ("getTypes" in startType) {
    // If the starting type is a union or interface type, recursively search each implementing type.
    let paths: string[][] = [];

    for (const type of startType.getTypes()) {
      const typePaths = findTypePathsInner(type, targetType, visited, [
        ...currentPath,
        type.name,
      ]);
      if (typePaths.length > 0) {
        paths = [...paths, ...typePaths];
      }
    }
    return paths;
  }

  if ("getValues" in startType) {
    // If the starting type is an enum type, recursively search each enum value.
    let paths: string[][] = [];

    for (const value of (startType.getValues as any)()) {
      const valuePaths = findTypePathsInner(value, targetType, visited, [
        ...currentPath,
        value.name,
      ]);
      if (valuePaths.length > 0) {
        paths = [...paths, ...valuePaths];
      }
    }
    return paths;
  }

  // If the starting type is not a recognized type, return an empty list.
  return [];
}

/**
 * Finds all paths to a given GraphQL type from another GraphQL type.
 * @param startType The starting GraphQL type to search from.
 * @param targetType The GraphQL type to search for.
 * @returns A list of paths to the targetType from the startType.
 */
export function findTypePaths(
  startType: GraphQLNamedType,
  targetType: GraphQLType
): string[][] {
  return findTypePathsInner(startType, targetType, new Set(), [startType.name]);
}
