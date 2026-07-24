# Snapvisor Upload Action

Upload screenshots to [Snapvisor](https://app.snapvisor.io) for visual regression
testing. A thin composite wrapper around [`@snapvisor/cli`](https://www.npmjs.com/package/@snapvisor/cli)
`upload` — generate your screenshots in CI, point this action at the folder, and it
creates a Snapvisor build and returns its URL.

## Usage

```yaml
name: Visual regression
on: pull_request

permissions:
  contents: read

jobs:
  snapvisor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # ... your build/test steps that produce ./screenshots ...

      - name: Upload to Snapvisor
        id: snapvisor
        uses: DevinoSolutions/snapvisor-action@v1
        with:
          token: ${{ secrets.ARGOS_TOKEN }}
          directory: ./screenshots

      - run: echo "Build ${{ steps.snapvisor.outputs.build-url }}"
```

## Inputs

| Input              | Required | Default  | Description                                                                   |
| ------------------ | -------- | -------- | ----------------------------------------------------------------------------- |
| `token`            | No       |          | Snapvisor project token. Optional — tokenless / OIDC setups may omit it.      |
| `directory`        | Yes      |          | Directory containing the screenshots to upload.                               |
| `build-name`       | No       |          | Build name, for running multiple Snapvisor builds in a single CI job.         |
| `parallel`         | No       | `false`  | Enable parallel mode (`true`/`false`) — run multiple builds and combine them. |
| `parallel-total`   | No       |          | Total number of parallel nodes being run.                                     |
| `parallel-nonce`   | No       |          | Unique ID shared by all nodes of a parallel build.                            |
| `reference-branch` | No       |          | Branch used as the baseline for screenshot comparison.                        |
| `cli-version`      | No       | `latest` | Version of `@snapvisor/cli` to run (npm dist-tag or version).                 |

## Outputs

| Output      | Description                                       |
| ----------- | ------------------------------------------------- |
| `build-url` | URL of the Snapvisor build created by the upload. |

## Environment variables (drop-in compat with Argos)

Snapvisor is a fork of Argos, and the CLI deliberately keeps the `ARGOS_*` env-var
names so existing Argos setups work unchanged. This action passes the `token` input
through as `ARGOS_TOKEN` for the CLI. If you are migrating from an Argos workflow,
your existing `ARGOS_TOKEN` secret and any `ARGOS_*` variables drop straight in.

## License

MIT — see [LICENSE](./LICENSE).
