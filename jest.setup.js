import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.MONGODB_URI = 'mongodb://localhost:27017'
process.env.MONGODB_DB_NAME = 'printing-marketplace-test'
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
