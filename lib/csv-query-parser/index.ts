/**
 * CSV Query Parser
 * Implements SQL-like query parsing for CSV data
 */

export interface QueryResult {
  columns: string[];
  rows: any[][];
  count: number;
}

export interface ParsedQuery {
  select: string[] | '*';
  where?: WhereClause[];
  orderBy?: OrderByClause[];
  limit?: number;
  offset?: number;
}

export interface WhereClause {
  column: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
  value: any;
  logic?: 'AND' | 'OR';
}

export interface OrderByClause {
  column: string;
  direction: 'ASC' | 'DESC';
}

export class CSVQueryParser {
  /**
   * Parse a SQL-like query string
   */
  static parseQuery(query: string): ParsedQuery {
    const result: ParsedQuery = {
      select: '*'
    };

    // Parse SELECT clause
    const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM/i);
    if (selectMatch) {
      const columns = selectMatch[1].trim();
      result.select = columns === '*' ? '*' : columns.split(',').map(c => c.trim());
    }

    // Parse WHERE clause
    const whereMatch = query.match(/WHERE\s+(.*?)(?:\s+ORDER BY|\s+LIMIT|$)/i);
    if (whereMatch) {
      result.where = this.parseWhereClause(whereMatch[1]);
    }

    // Parse ORDER BY clause
    const orderByMatch = query.match(/ORDER BY\s+(.*?)(?:\s+LIMIT|$)/i);
    if (orderByMatch) {
      result.orderBy = this.parseOrderByClause(orderByMatch[1]);
    }

    // Parse LIMIT clause
    const limitMatch = query.match(/LIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i);
    if (limitMatch) {
      result.limit = parseInt(limitMatch[1]);
      if (limitMatch[2]) {
        result.offset = parseInt(limitMatch[2]);
      }
    }

    return result;
  }

  /**
   * Parse WHERE clause
   */
  private static parseWhereClause(whereStr: string): WhereClause[] {
    const clauses: WhereClause[] = [];
    
    // Split by AND/OR (simple implementation)
    const parts = whereStr.split(/\s+(AND|OR)\s+/i);
    
    for (let i = 0; i < parts.length; i += 2) {
      const part = parts[i].trim();
      const logic = parts[i + 1] as 'AND' | 'OR' | undefined;
      
      // Parse individual condition
      const condition = this.parseCondition(part);
      if (condition) {
        condition.logic = logic;
        clauses.push(condition);
      }
    }
    
    return clauses;
  }

  /**
   * Parse a single condition
   */
  private static parseCondition(condition: string): WhereClause | null {
    // Match operators
    const operators = ['>=', '<=', '!=', '=', '>', '<', 'LIKE', 'IN'];
    
    for (const op of operators) {
      const regex = new RegExp(`(.+?)\\s*${op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(.+)`, 'i');
      const match = condition.match(regex);
      
      if (match) {
        const column = match[1].trim();
        let value: any = match[2].trim();
        
        // Remove quotes from string values
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        } else if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        // Parse IN clause
        if (op.toUpperCase() === 'IN') {
          value = value.replace(/[()]/g, '').split(',').map((v: string) => v.trim().replace(/['"]/g, ''));
        }
        
        // Try to parse as number
        if (!isNaN(Number(value)) && value !== '') {
          value = Number(value);
        }
        
        return {
          column,
          operator: op.toUpperCase() as any,
          value
        };
      }
    }
    
    return null;
  }

  /**
   * Parse ORDER BY clause
   */
  private static parseOrderByClause(orderByStr: string): OrderByClause[] {
    const clauses: OrderByClause[] = [];
    
    const parts = orderByStr.split(',');
    for (const part of parts) {
      const match = part.trim().match(/(.+?)\s+(ASC|DESC)?$/i);
      if (match) {
        clauses.push({
          column: match[1].trim(),
          direction: (match[2]?.toUpperCase() as 'ASC' | 'DESC') || 'ASC'
        });
      }
    }
    
    return clauses;
  }

  /**
   * Execute a parsed query on CSV data
   */
  static executeQuery(data: any[], query: ParsedQuery): QueryResult {
    let results = [...data];
    
    // Apply WHERE filter
    if (query.where && query.where.length > 0) {
      results = this.applyWhereFilter(results, query.where);
    }
    
    // Apply ORDER BY
    if (query.orderBy && query.orderBy.length > 0) {
      results = this.applyOrderBy(results, query.orderBy);
    }
    
    // Apply LIMIT and OFFSET
    if (query.offset !== undefined) {
      results = results.slice(query.offset);
    }
    if (query.limit !== undefined) {
      results = results.slice(0, query.limit);
    }
    
    // Apply SELECT
    const columns = query.select === '*' 
      ? Object.keys(results[0] || {})
      : query.select;
    
    const rows = results.map(row => {
      return columns.map(col => row[col]);
    });
    
    return {
      columns,
      rows,
      count: rows.length
    };
  }

  /**
   * Apply WHERE filter
   */
  private static applyWhereFilter(data: any[], clauses: WhereClause[]): any[] {
    return data.filter(row => {
      let result = true;
      let currentLogic: 'AND' | 'OR' | undefined = 'AND';
      
      for (const clause of clauses) {
        const matches = this.evaluateCondition(row, clause);
        
        if (currentLogic === 'AND') {
          result = result && matches;
        } else {
          result = result || matches;
        }
        
        currentLogic = clause.logic;
      }
      
      return result;
    });
  }

  /**
   * Evaluate a single condition
   */
  private static evaluateCondition(row: any, clause: WhereClause): boolean {
    const value = row[clause.column];
    
    switch (clause.operator) {
      case '=':
        return value == clause.value;
      
      case '!=':
        return value != clause.value;
      
      case '>':
        return value > clause.value;
      
      case '<':
        return value < clause.value;
      
      case '>=':
        return value >= clause.value;
      
      case '<=':
        return value <= clause.value;
      
      case 'LIKE':
        const pattern = clause.value.replace(/%/g, '.*');
        return new RegExp(pattern, 'i').test(String(value));
      
      case 'IN':
        return Array.isArray(clause.value) && clause.value.includes(value);
      
      default:
        return false;
    }
  }

  /**
   * Apply ORDER BY
   */
  private static applyOrderBy(data: any[], clauses: OrderByClause[]): any[] {
    return data.sort((a, b) => {
      for (const clause of clauses) {
        const aVal = a[clause.column];
        const bVal = b[clause.column];
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;
        
        if (comparison !== 0) {
          return clause.direction === 'DESC' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }
}

/**
 * Query CSV data with SQL-like syntax
 */
export function queryCSV(data: any[], query: string): QueryResult {
  const parsedQuery = CSVQueryParser.parseQuery(query);
  return CSVQueryParser.executeQuery(data, parsedQuery);
}
