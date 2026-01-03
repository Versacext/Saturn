import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    type RouteConfigEntry,
    index,
    route,
} from '@react-router/dev/routes';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

type Tree = {
    path: string;
    children: Tree[];
    hasPage: boolean;
};

// Список папок, которые НЕ должны становиться страницами сайта
const IGNORED_DIRS = ['api', '__create', 'components', 'utils'];

function buildRouteTree(dir: string, basePath = ''): Tree {
    // Проверка на существование директории (защита от ENOENT)
    if (!existsSync(dir)) {
        return { path: basePath, children: [], hasPage: false };
    }

    const files = readdirSync(dir);
    const node: Tree = {
        path: basePath,
        children: [],
        hasPage: false,
    };

    for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            // Игнорируем папку api и другие системные папки
            if (IGNORED_DIRS.includes(file)) continue;

            const childPath = basePath ? `${basePath}/${file}` : file;
            const childNode = buildRouteTree(filePath, childPath);
            node.children.push(childNode);
        } else if (file === 'page.jsx') {
            node.hasPage = true;
        }
    }

    return node;
}

function generateRoutes(node: Tree): RouteConfigEntry[] {
    const routes: RouteConfigEntry[] = [];

    if (node.hasPage) {
        const componentPath = node.path === '' ? `./page.jsx` : `./${node.path}/page.jsx`;
        
        if (node.path === '') {
            routes.push(index(componentPath));
        } else {
            let routePath = node.path;
            const segments = routePath.split('/');
            const processedSegments = segments.map((segment) => {
                if (segment.startsWith('[') && segment.endsWith(']')) {
                    const paramName = segment.slice(1, -1);
                    if (paramName.startsWith('...')) return '*';
                    return `:${paramName}`;
                }
                return segment;
            });
            routePath = processedSegments.join('/');
            routes.push(route(routePath, componentPath));
        }
    }

    for (const child of node.children) {
        routes.push(...generateRoutes(child));
    }

    return routes;
}

const tree = buildRouteTree(__dirname);
const notFound = route('*?', './__create/not-found.tsx');
const routes = [...generateRoutes(tree), notFound];

export default routes;