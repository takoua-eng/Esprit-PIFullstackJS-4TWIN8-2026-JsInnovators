/**
 * Generates a Postman Collection v2.1 for the Mediflow API.
 * Run: node scripts/generate-postman.js
 * Output: postman/Mediflow-API.postman_collection.json
 *
 * Share the file with your friend; they can import it in Postman
 * and set the baseUrl variable (e.g. http://localhost:3000).
 */

const fs = require('node:fs');
const path = require('node:path');

const collection = {
  info: {
    name: 'Mediflow API',
    description: 'Mediflow backend API. Set variable `baseUrl` (e.g. http://localhost:3000).',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:3000' },
    { key: 'token', value: '', type: 'string' },
    { key: 'userId', value: 'mediflow1', type: 'string' },
    { key: 'roleId', value: '', type: 'string' },
  ],
  item: [
    {
      name: 'Auth',
      item: [
        {
          name: 'Sign Up',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john@example.com',
                  password: 'SecurePass123!',
                  roleId: '{{roleId}}',
                },
                null,
                2,
              ),
            },
            url: '{{baseUrl}}/auth/signup',
          },
        },
        {
          name: 'Sign In',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ email: 'john@example.com', password: 'SecurePass123!' }, null, 2),
            },
            url: '{{baseUrl}}/auth/signin',
          },
        },
        {
          name: 'Forgot Password',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ email: 'john@example.com' }, null, 2),
            },
            url: '{{baseUrl}}/auth/forgot-password',
          },
        },
        {
          name: 'Reset Password',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                { token: 'RESET_TOKEN_FROM_EMAIL', newPassword: 'NewSecurePass123!' },
                null,
                2,
              ),
            },
            url: '{{baseUrl}}/auth/reset-password',
          },
        },
      ],
    },
    {
      name: 'Users',
      item: [
        {
          name: 'Create User',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify(
                {
                  firstName: 'Alice',
                  lastName: 'Martin',
                  email: 'alice@example.com',
                  password: 'SecurePass123!',
                  roleId: '{{roleId}}',
                  dateOfBirth: '2000-03-15T00:00:00.000Z',
                  gender: 'female',
                },
                null,
                2,
              ),
            },
            url: '{{baseUrl}}/users',
          },
        },
        {
          name: 'Get All Users',
          request: { method: 'GET', url: '{{baseUrl}}/users' },
        },
        {
          name: 'Get User by ID',
          request: { method: 'GET', url: '{{baseUrl}}/users/{{userId}}' },
        },
        {
          name: 'Update User',
          request: {
            method: 'PUT',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ firstName: 'Alice', lastName: 'Martin', phone: '+33612345678' }, null, 2),
            },
            url: '{{baseUrl}}/users/{{userId}}',
          },
        },
        {
          name: 'Upload Avatar',
          request: {
            method: 'POST',
            body: {
              mode: 'formdata',
              formdata: [{ key: 'avatar', type: 'file', src: '', description: 'Image file (any field name works)' }],
            },
            url: '{{baseUrl}}/users/{{userId}}/avatar',
          },
        },
        {
          name: 'Delete User',
          request: { method: 'DELETE', url: '{{baseUrl}}/users/{{userId}}' },
        },
      ],
    },
    {
      name: 'Roles',
      item: [
        {
          name: 'Create Role',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ name: 'ADMIN', description: 'Administrator' }, null, 2),
            },
            url: '{{baseUrl}}/roles',
          },
        },
        {
          name: 'Get All Roles',
          request: { method: 'GET', url: '{{baseUrl}}/roles' },
        },
        {
          name: 'Get Role by ID',
          request: { method: 'GET', url: '{{baseUrl}}/roles/{{roleId}}' },
        },
        {
          name: 'Update Role',
          request: {
            method: 'PUT',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            body: {
              mode: 'raw',
              raw: JSON.stringify({ name: 'ADMIN', description: 'Updated description' }, null, 2),
            },
            url: '{{baseUrl}}/roles/{{roleId}}',
          },
        },
        {
          name: 'Delete Role',
          request: { method: 'DELETE', url: '{{baseUrl}}/roles/{{roleId}}' },
        },
      ],
    },
    {
      name: 'Upload',
      item: [
        {
          name: 'Upload File',
          request: {
            method: 'POST',
            body: {
              mode: 'formdata',
              formdata: [{ key: 'file', type: 'file', src: '', description: 'Any file' }],
            },
            url: '{{baseUrl}}/upload',
          },
        },
      ],
    },
  ],
};

const outDir = path.join(__dirname, '..', 'postman');
const outFile = path.join(outDir, 'Mediflow-API.postman_collection.json');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outFile, JSON.stringify(collection, null, 2), 'utf8');
console.log('Postman collection written to:', outFile);
console.log('Import this file in Postman (Import → Upload Files).');
console.log('Set the "baseUrl" variable (e.g. http://localhost:3000).');
