/**
 * Unit tests for the action's main functionality, src/main.ts
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mock the API module
const mockDeleteService = jest.fn()

jest.unstable_mockModule('../src/api.js', () => ({
  deleteService: mockDeleteService
}))

// Mock @actions/core
jest.unstable_mockModule('@actions/core', () => core)

// Import the module being tested after mocks are set up
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementation
    mockDeleteService.mockResolvedValue(undefined)
  })

  it('Successfully deletes a service', async () => {
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'project_id':
          return 'project-456'
        case 'service_id':
          return 'service-789'
        case 'api_key':
          return 'public-key:secret-key'
        default:
          return ''
      }
    })

    await run()

    // Verify deleteService was called with correct parameters
    expect(mockDeleteService).toHaveBeenCalledWith(
      'project-456',
      'service-789',
      'public-key:secret-key'
    )

    // Verify success message was logged
    expect(core.info).toHaveBeenCalledWith(
      'Starting delete operation for service service-789...'
    )
    expect(core.info).toHaveBeenCalledWith(
      'Successfully deleted service: service-789'
    )

    // Verify no failures
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('Fails when deleteService API call fails', async () => {
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'project_id':
          return 'project-456'
        case 'service_id':
          return 'service-789'
        case 'api_key':
          return 'public-key:secret-key'
        default:
          return ''
      }
    })

    // Mock API failure
    mockDeleteService.mockRejectedValue(new Error('API Error: Unauthorized'))

    await run()

    // Verify action failed with API error
    expect(core.setFailed).toHaveBeenCalledWith('API Error: Unauthorized')

    // Verify deleteService was called
    expect(mockDeleteService).toHaveBeenCalled()
  })

  it('Fails when service not found (404)', async () => {
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'project_id':
          return 'project-456'
        case 'service_id':
          return 'nonexistent-service'
        case 'api_key':
          return 'public-key:secret-key'
        default:
          return ''
      }
    })

    // Mock 404 error
    mockDeleteService.mockRejectedValue(
      new Error('API Error (404): Service not found')
    )

    await run()

    // Verify action failed with 404 error
    expect(core.setFailed).toHaveBeenCalledWith(
      'API Error (404): Service not found'
    )
  })

  it('Fails when network error occurs', async () => {
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'project_id':
          return 'project-456'
        case 'service_id':
          return 'service-789'
        case 'api_key':
          return 'public-key:secret-key'
        default:
          return ''
      }
    })

    // Mock network error
    mockDeleteService.mockRejectedValue(
      new Error('Network request failed: Connection timeout')
    )

    await run()

    // Verify action failed with network error
    expect(core.setFailed).toHaveBeenCalledWith(
      'Network request failed: Connection timeout'
    )
  })

  it('Handles authentication errors (401)', async () => {
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'project_id':
          return 'project-456'
        case 'service_id':
          return 'service-789'
        case 'api_key':
          return 'invalid:key'
        default:
          return ''
      }
    })

    // Mock authentication error
    mockDeleteService.mockRejectedValue(
      new Error('API Error (401): Unauthorized')
    )

    await run()

    // Verify action failed with auth error
    expect(core.setFailed).toHaveBeenCalledWith('API Error (401): Unauthorized')
  })

  it('Handles permission errors (403)', async () => {
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'project_id':
          return 'project-456'
        case 'service_id':
          return 'service-789'
        case 'api_key':
          return 'public-key:secret-key'
        default:
          return ''
      }
    })

    // Mock permission error
    mockDeleteService.mockRejectedValue(
      new Error(
        'API Error (403): Forbidden - insufficient permissions to delete service'
      )
    )

    await run()

    // Verify action failed with permission error
    expect(core.setFailed).toHaveBeenCalledWith(
      'API Error (403): Forbidden - insufficient permissions to delete service'
    )
  })

  it('Handles non-Error exceptions', async () => {
    core.getInput.mockImplementation((name: string) => {
      switch (name) {
        case 'project_id':
          return 'project-456'
        case 'service_id':
          return 'service-789'
        case 'api_key':
          return 'public-key:secret-key'
        default:
          return ''
      }
    })

    // Mock non-Error exception (e.g., string thrown)
    mockDeleteService.mockRejectedValue('Unexpected error occurred')

    await run()

    // Verify action failed with stringified error
    expect(core.setFailed).toHaveBeenCalledWith('Unexpected error occurred')
  })
})
