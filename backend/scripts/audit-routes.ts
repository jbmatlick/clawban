#!/usr/bin/env tsx
/**
 * Route Audit Script
 * 
 * Scans all route files and detects:
 * - Duplicate routes
 * - Non-RESTful naming
 * - Missing validation
 * - Undocumented routes (not in ROUTES.md)
 * 
 * Run: npx tsx scripts/audit-routes.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Route {
  method: string;
  path: string;
  file: string;
  line: number;
  controller?: string;
  validators?: string[];
}

interface AuditResult {
  routes: Route[];
  duplicates: Route[][];
  nonRestful: Route[];
  missingValidation: Route[];
  undocumented: Route[];
}

/**
 * Extract routes from a route file
 */
function extractRoutes(filePath: string): Route[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const routes: Route[] = [];
  
  // Determine mount point from filename (task.routes.ts → /api/tasks)
  const fileName = path.basename(filePath);
  let mountPoint = '/api';
  if (fileName.includes('task.routes')) mountPoint = '/api/tasks';
  else if (fileName.includes('tag.routes')) mountPoint = '/api/tags';
  else if (fileName.includes('gateway.routes')) mountPoint = '/api/gateway';
  
  const routePattern = /router\.(get|post|patch|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/;
  
  lines.forEach((line, index) => {
    const match = line.match(routePattern);
    if (match) {
      const [, method, routePath] = match;
      
      // Construct full path
      let fullPath = routePath === '/' ? mountPoint : `${mountPoint}${routePath}`;
      
      // Extract controller
      const controllerMatch = line.match(/,\s*([a-zA-Z_$][a-zA-Z0-9_$]*\.[a-zA-Z_$][a-zA-Z0-9_$]*)\s*\)/);
      
      // Extract validators (check for array, single validator, or spread)
      const hasValidators = 
        line.includes('Validator') || 
        line.includes('...idParamValidator') ||
        line.includes('[...') ||
        line.includes('body(') ||
        line.includes('param(');
      
      routes.push({
        method: method.toUpperCase(),
        path: fullPath,
        file: path.basename(filePath),
        line: index + 1,
        controller: controllerMatch?.[1],
        validators: hasValidators ? ['detected'] : [],
      });
    }
  });
  
  return routes;
}

/**
 * Find all route files
 */
function findRouteFiles(dir: string): string[] {
  const routesDir = path.join(dir, 'src', 'routes');
  if (!fs.existsSync(routesDir)) {
    console.error(`❌ Routes directory not found: ${routesDir}`);
    process.exit(1);
  }
  
  return fs.readdirSync(routesDir)
    .filter(file => file.endsWith('.routes.ts'))
    .map(file => path.join(routesDir, file));
}

/**
 * Detect duplicate routes
 */
function findDuplicates(routes: Route[]): Route[][] {
  const groups = new Map<string, Route[]>();
  
  routes.forEach(route => {
    const key = `${route.method} ${route.path}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(route);
  });
  
  return Array.from(groups.values()).filter(group => group.length > 1);
}

/**
 * Check if route follows RESTful conventions
 */
function isRestful(route: Route): boolean {
  const { method, path } = route;
  
  // Check for action-named routes (bad)
  const actionWords = ['get', 'create', 'update', 'delete', 'list', 'add', 'remove', 'fetch'];
  const pathParts = path.split('/').filter(Boolean);
  
  for (const part of pathParts) {
    if (actionWords.includes(part.toLowerCase())) {
      return false; // Action in URL is non-RESTful
    }
  }
  
  // Check for inconsistent verb usage
  if (method === 'GET' && path.includes('delete')) return false;
  if (method === 'POST' && path.includes('get')) return false;
  
  return true;
}

/**
 * Check if route has validation
 */
function hasValidation(route: Route): boolean {
  // Health check and gateway endpoints don't need validation
  if (route.path === '/health' || route.path === '/ready') return true;
  if (route.method === 'GET' && !route.path.includes(':')) return true; // List endpoints
  
  // POST/PUT/PATCH without params (e.g., /restart) are OK if they don't take body params
  if (route.method === 'POST' && !route.path.includes(':') && route.path.includes('restart')) return true;
  if (route.method === 'POST' && !route.path.includes(':') && route.path.includes('health')) return true;
  
  return route.validators && route.validators.length > 0;
}

/**
 * Load documented routes from ROUTES.md
 */
function loadDocumentedRoutes(dir: string): Set<string> {
  const routesDoc = path.join(dir, 'ROUTES.md');
  
  if (!fs.existsSync(routesDoc)) {
    console.warn('⚠️  ROUTES.md not found');
    return new Set();
  }
  
  const content = fs.readFileSync(routesDoc, 'utf-8');
  const documented = new Set<string>();
  
  // Match patterns like "GET /api/tasks/:id"
  const pattern = /(GET|POST|PATCH|PUT|DELETE)\s+(\/[^\s\n]*)/g;
  let match;
  
  while ((match = pattern.exec(content)) !== null) {
    documented.add(`${match[1]} ${match[2]}`);
  }
  
  return documented;
}

/**
 * Run audit
 */
function audit(): AuditResult {
  const backendDir = process.cwd();
  
  // Find and parse all routes
  const routeFiles = findRouteFiles(backendDir);
  const allRoutes: Route[] = [];
  
  console.log('📂 Scanning route files...\n');
  
  routeFiles.forEach(file => {
    const routes = extractRoutes(file);
    console.log(`  ${path.basename(file)}: ${routes.length} routes`);
    allRoutes.push(...routes);
  });
  
  console.log(`\n✅ Total routes found: ${allRoutes.length}\n`);
  
  // Run checks
  const duplicates = findDuplicates(allRoutes);
  const nonRestful = allRoutes.filter(r => !isRestful(r));
  const missingValidation = allRoutes.filter(r => !hasValidation(r));
  
  // Check documentation
  const documented = loadDocumentedRoutes(backendDir);
  const undocumented = allRoutes.filter(route => {
    const key = `${route.method} ${route.path}`;
    return !documented.has(key);
  });
  
  return {
    routes: allRoutes,
    duplicates,
    nonRestful,
    missingValidation,
    undocumented,
  };
}

/**
 * Print audit report
 */
function printReport(result: AuditResult): void {
  console.log('═'.repeat(60));
  console.log('                    ROUTE AUDIT REPORT');
  console.log('═'.repeat(60));
  console.log();
  
  // Summary
  const issues = 
    result.duplicates.length +
    result.nonRestful.length +
    result.missingValidation.length +
    result.undocumented.length;
  
  if (issues === 0) {
    console.log('✅ No issues found! All routes are clean.\n');
  } else {
    console.log(`⚠️  Found ${issues} issue(s)\n`);
  }
  
  // Duplicates
  if (result.duplicates.length > 0) {
    console.log('🔴 DUPLICATE ROUTES:');
    console.log('─'.repeat(60));
    result.duplicates.forEach(group => {
      const route = group[0];
      console.log(`\n  ${route.method} ${route.path}`);
      group.forEach(r => {
        console.log(`    → ${r.file}:${r.line}`);
      });
    });
    console.log();
  } else {
    console.log('✅ No duplicate routes\n');
  }
  
  // Non-RESTful
  if (result.nonRestful.length > 0) {
    console.log('🟡 NON-RESTFUL ROUTES:');
    console.log('─'.repeat(60));
    result.nonRestful.forEach(route => {
      console.log(`  ${route.method} ${route.path}`);
      console.log(`    → ${route.file}:${route.line}`);
      console.log(`    Fix: Use RESTful naming (nouns + HTTP verbs)\n`);
    });
  } else {
    console.log('✅ All routes follow RESTful conventions\n');
  }
  
  // Missing validation
  if (result.missingValidation.length > 0) {
    console.log('🟡 MISSING VALIDATION:');
    console.log('─'.repeat(60));
    result.missingValidation.forEach(route => {
      console.log(`  ${route.method} ${route.path}`);
      console.log(`    → ${route.file}:${route.line}`);
      console.log(`    Fix: Add validation middleware\n`);
    });
  } else {
    console.log('✅ All routes have validation\n');
  }
  
  // Undocumented
  if (result.undocumented.length > 0) {
    console.log('🟡 UNDOCUMENTED ROUTES (not in ROUTES.md):');
    console.log('─'.repeat(60));
    result.undocumented.forEach(route => {
      console.log(`  ${route.method} ${route.path}`);
      console.log(`    → ${route.file}:${route.line}\n`);
    });
  } else {
    console.log('✅ All routes are documented\n');
  }
  
  console.log('═'.repeat(60));
  console.log(`Total routes: ${result.routes.length}`);
  console.log(`Issues: ${issues}`);
  console.log('═'.repeat(60));
  console.log();
  
  if (issues > 0) {
    console.log('💡 Run this audit before every merge to maintain quality.');
    process.exit(1); // Exit with error code
  } else {
    console.log('🎉 Route audit passed!');
    process.exit(0);
  }
}

/**
 * Main
 */
function main() {
  console.log('🔍 Running route audit...\n');
  
  const result = audit();
  printReport(result);
}

main();
