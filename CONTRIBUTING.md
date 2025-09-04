# Contributing to URL Shortener

Thank you for your interest in contributing to the URL Shortener project! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (local or cloud instance)
- Git

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/url-shortener.git
   cd url-shortener
   ```

3. Install dependencies:
   ```bash
   # For Windows PowerShell
   .\setup.ps1
   
   # For Linux/macOS
   ./setup.sh
   
   # Or manually
   npm run setup
   ```

4. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`
   - Update the values according to your setup

5. Start development servers:
   ```bash
   npm run dev
   ```

## Development Process

### Branch Naming Convention

- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

### Commit Message Format

Follow the conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:
```
feat(auth): add password reset functionality
fix(url): resolve duplicate short code generation
docs(readme): update installation instructions
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the coding standards
3. Add or update tests as necessary
4. Update documentation if needed
5. Ensure all tests pass
6. Create a pull request with:
   - Clear title and description
   - Reference to related issues
   - Screenshots if applicable (for UI changes)

### Pull Request Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added/updated tests for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)

## Additional Notes
```

## Coding Standards

### Backend (Node.js/Express)

- Use ES6+ features
- Follow RESTful API conventions
- Implement proper error handling
- Add input validation
- Use middleware for common functionality
- Write descriptive variable and function names
- Add JSDoc comments for functions

Example:
```javascript
/**
 * Generate a unique short code for URL
 * @param {number} length - Length of the short code
 * @returns {Promise<string>} - Generated short code
 */
const generateShortCode = async (length = 6) => {
  // Implementation
};
```

### Frontend (React/JavaScript)

- Use functional components with hooks
- Follow React best practices
- Use TypeScript when possible
- Implement proper prop validation
- Use consistent naming conventions
- Keep components small and focused
- Add proper error boundaries

Example:
```jsx
const UrlCard = ({ url, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Component content */}
    </div>
  );
};
```

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use semantic color classes
- Group related classes logically

## Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/          # Database and app configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.js         # App entry point
├── .env.example         # Environment variables template
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts
│   ├── pages/           # Page components
│   ├── styles/          # Global styles
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   └── main.jsx         # App entry point
├── .env.example         # Environment variables template
└── package.json
```

## Testing

### Backend Testing
- Use Jest for unit testing
- Test API endpoints
- Mock database interactions
- Test middleware functions

### Frontend Testing
- Use Vitest for testing
- Test component rendering
- Test user interactions
- Test API integration

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for new functions
- Update API documentation
- Include examples in documentation

## Getting Help

- Check existing issues and pull requests
- Create a new issue for bugs or feature requests
- Join our community discussions
- Contact maintainers for complex questions

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.
