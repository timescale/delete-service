<div align=center>
<picture align=center>
    <source media="(prefers-color-scheme: dark)" srcset="https://assets.timescale.com/docs/images/tigerdata-gradient-white.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://assets.timescale.com/docs/images/tigerdata-gradient-black.svg">
    <img alt="TigerData logo" >
</picture>

Delete a Tiger Data database service

</div>

## Usage Examples

### Minimal Example

```yaml
- name: Delete Database Service
  uses: timescale/delete-service@v1
  with:
    project_id: your-project-id
    service_id: your-service-id
    api_key: ${{ secrets.TIGERDATA_API_KEY }}
```

### Delete Ephemeral Test Database After PR Tests

Clean up temporary databases created for testing:

```yaml
name: Test and Cleanup
on: pull_request

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Fork Database for Testing
        id: fork
        uses: timescale/fork-service@v1
        with:
          project_id: your-project-id
          service_id: your-production-service-id
          api_key: ${{ secrets.TIGERDATA_API_KEY }}
          fork_strategy: last-snapshot
          name: test-${{ github.event.pull_request.number }}

      - name: Run Tests
        env:
          DATABASE_URL:
            postgresql://tsdbadmin:${{ steps.fork.outputs.initial_password
            }}@${{ steps.fork.outputs.host }}:${{ steps.fork.outputs.port
            }}/tsdb?sslmode=require
        run: npm test

      - name: Delete Test Database
        if: always()
        uses: timescale/delete-service@v1
        with:
          project_id: your-project-id
          service_id: ${{ steps.fork.outputs.service_id }}
          api_key: ${{ secrets.TIGERDATA_API_KEY }}
```

### Delete Service by Name Pattern

Delete services created by CI that match a specific naming pattern:

```yaml
name: Cleanup Old Test Databases
on:
  schedule:
    - cron: '0 2 * * *' # Run daily at 2 AM

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: List and Delete Old Test Services
        env:
          TIGERDATA_API_KEY: ${{ secrets.TIGERDATA_API_KEY }}
        run: |
          # Get list of services older than 7 days with 'test-' prefix
          # (requires custom script using TigerData API)
          # Then delete each one using this action
          echo "service-id-1 service-id-2 service-id-3" | while read service_id; do
            gh workflow run delete-service.yml \
              -f project_id=your-project-id \
              -f service_id=$service_id
          done
```

### Manual Cleanup Workflow

Allow manual deletion of services via workflow dispatch:

```yaml
name: Delete Service
on:
  workflow_dispatch:
    inputs:
      service_id:
        description: 'Service ID to delete'
        required: true
        type: string
      project_id:
        description: 'Project ID'
        required: true
        type: string

jobs:
  delete:
    runs-on: ubuntu-latest
    steps:
      - name: Delete Database Service
        uses: timescale/delete-service@v1
        with:
          project_id: ${{ inputs.project_id }}
          service_id: ${{ inputs.service_id }}
          api_key: ${{ secrets.TIGERDATA_API_KEY }}
```

## Inputs

| Input        | Required | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `project_id` | Yes      | The project ID of your service                       |
| `service_id` | Yes      | The service ID to delete                             |
| `api_key`    | Yes      | A Tiger Data API key in format `publicKey:secretKey` |

## Important Notes

- **Deletion is permanent**: This action permanently deletes database services.
  Ensure you have backups if needed.
- **No confirmation**: The action will delete the service immediately without
  asking for confirmation.
- **Use with caution**: Only use this action on services you intend to delete,
  such as ephemeral test databases or temporary forks.
- **Best practice**: Use `if: always()` when cleaning up test databases to
  ensure deletion happens even if tests fail.

## Use Cases

This action is particularly useful for:

- **Cleaning up test databases**: Delete ephemeral databases created during CI
  runs
- **Managing temporary forks**: Remove database forks created with
  `timescale/fork-service` after testing
- **Cost optimization**: Automatically delete unused development or staging
  databases
- **Scheduled cleanup**: Remove old test services on a regular schedule
- **Pull request workflows**: Create and destroy isolated database environments
  for each PR

## Integration with fork-service

This action pairs perfectly with
[timescale/fork-service](https://github.com/timescale/fork-service):

1. Use `fork-service` to create temporary database for testing
2. Run your tests against the forked database
3. Use `delete-service` to clean up the temporary database

Note: `fork-service` has a built-in `cleanup: true` option for automatic
cleanup, but this `delete-service` action gives you more control over when and
how deletion happens.
