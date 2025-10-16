import * as core from '@actions/core'
import { deleteService } from './api.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    // Get inputs from action.yml
    const projectId: string = core.getInput('project_id', { required: true })
    const serviceId: string = core.getInput('service_id', { required: true })
    const apiKey: string = core.getInput('api_key', { required: true })

    core.info(`Starting delete operation for service ${serviceId}...`)

    // Delete the service
    await deleteService(projectId, serviceId, apiKey)

    core.info(`Successfully deleted service: ${serviceId}`)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed(String(error))
    }
  }
}
