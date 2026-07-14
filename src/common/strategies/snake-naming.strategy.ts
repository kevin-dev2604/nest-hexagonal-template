import { DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";
import { snakeCase } from 'typeorm/util/StringUtils'; // typeorm 내부 유틸 사용

export class SnakeNamingStartegy extends DefaultNamingStrategy implements NamingStrategyInterface {
  tableName(className: string, customName: string): string {
    return customName ? customName : snakeCase(className);
  }

  columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
    return (
      snakeCase(embeddedPrefixes.concat('').join('_')) +
      (customName ? customName : snakeCase(propertyName))
    );
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(relationName + '_' + referencedColumnName);
  }

  joinTableName(firstTableName: string, secondTableName: string, firstPropertyName: string): string {
    return snakeCase(firstTableName + '_' + firstPropertyName + '_' + secondTableName);
  }

  joinTableColumnName(tableName: string, columnName: string, secondTableName?: string): string {
    return snakeCase(tableName + '_' + (secondTableName ? columnName : columnName));
  }
}