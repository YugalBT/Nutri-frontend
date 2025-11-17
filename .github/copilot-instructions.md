# Nutri Frontend - Copilot Instructions

## Project Overview
This is an Angular 18 frontend application for a nutrition-related platform.

## Technology Stack
- **Framework**: Angular 18
- **Language**: TypeScript
- **Build Tool**: Angular CLI
- **Package Manager**: npm
- **Styling**: CSS
- **Routing**: Enabled

## Project Structure
```
src/
├── app/
│   ├── app.component.ts        # Root component
│   ├── app.component.html      # Root template
│   ├── app.component.css       # Root styles
│   ├── app.config.ts           # Application configuration
│   ├── app.routes.ts           # Routing configuration
│   └── app.component.spec.ts   # Component tests
├── main.ts                     # Application entry point
├── index.html                  # HTML template
└── styles.css                  # Global styles
public/
├── favicon.ico                 # Favicon
angular.json                    # Angular CLI configuration
package.json                    # Dependencies and scripts
tsconfig.json                   # TypeScript configuration
```

## Available Commands
- `npm start` - Start development server (http://localhost:4200)
- `npm run build` - Build for production
- `npm run watch` - Build in watch mode
- `npm test` - Run unit tests

## Development Guidelines
- Use standalone components (default in Angular 18)
- Follow Angular style guide and best practices
- Use TypeScript strict mode
- Components should be modular and reusable
- Use Angular Router for navigation
- Use reactive forms when needed

## Getting Started
1. The project is already set up with all dependencies installed
2. Run `npm start` to launch the development server
3. Navigate to `http://localhost:4200/` in your browser
4. The application will automatically reload when you modify any source files

## Build for Production
Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.
