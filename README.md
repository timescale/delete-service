<div align=center>
<picture align=center>
    <source media="(prefers-color-scheme: dark)" srcset="https://assets.timescale.com/docs/images/tigerdata-gradient-white.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://assets.timescale.com/docs/images/tigerdata-gradient-black.svg">
    <img alt="TigerData logo" >
</picture>

Delete a Tiger Cloud database service

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

## Inputs

| Input        | Required | Description                                          |
| ------------ | -------- | ---------------------------------------------------- |
| `project_id` | Yes      | The project ID of your service                       |
| `service_id` | Yes      | The service ID to delete                             |
| `api_key`    | Yes      | A Tiger Data API key in format `publicKey:secretKey` |

## Important Notes

- **Deletion is permanent**: This action permanently deletes database services.
  Ensure you have backups if needed.


## Use Cases

This action is particularly useful for deleting test databases created with the `timescale/fork-service` action.
A typical workflow could be to create a test database when a PR is created, use it to verify requirements manually, and then delete the database when the PR is merged.


## Integration with fork-service

This action pairs perfectly with
[timescale/fork-service](https://github.com/timescale/fork-service):

1. Use `fork-service` to create temporary database for testing
2. Run your tests against the forked database
3. Use `delete-service` to clean up the temporary database

Note: `fork-service` has a built-in `cleanup: true` option for automatic
cleanup, but this `delete-service` action gives you more control over when and
how deletion happens.
