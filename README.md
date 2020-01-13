# GitHub action to create a [deployment status](https://developer.github.com/v3/repos/deployments/#create-a-deployment-status)

## Usage

```yml
name: yo
on:
  push:

jobs:
  yo:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v1
      - name: create deployment
        id: deployment
        uses: shareup/create-deployment-action@master
      - name: set deployment status to in_progress
        uses: shareup/create-deployment-status-action@master
        with:
          deployment_id: ${{ steps.deployment.outputs.id }}
          state: in_progress

      # ... other steps ...

      - name: set deployment status to success
        uses: shareup/create-deployment-status-action@master
        with:
          deployment_id: ${{ steps.deployment.outputs.id }}
          state: success
```

## Outputs

* `response`
