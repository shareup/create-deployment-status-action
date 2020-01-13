import { getInput, setOutput, setFailed } from '@actions/core'
import { context } from '@actions/github'
import { Octokit } from '@octokit/core'
import { OctokitResponse } from '@octokit/types'

const validDeploymentStates = ['error', 'failure', 'in_progress', 'queued', 'pending', 'success']

const debug = isTrue(getInput('debug'))
const token = getInput('github_token', { required: true })

const id = getInput('deployment_id', { required: true })
const state = getInput('state', { required: true })
const repo = input('repo', context.repo.repo)
const owner = input('owner', context.repo.owner)
const description = input('description')
const logURL = input('log_url')
const environmentURL = input('environment_url')


let log = null

if (debug) {
  log = console
}

const client = new Octokit({ auth: token, log })

;(async () => {
  try {
    const response = await createDeploymentStatus(id, state, filterMissing({
      description,
      log_url: logURL,
      environment_url: environmentURL
    }))

    output('response', JSON.stringify(response))
  } catch (e) {
    setFailed(`error: ${e.stack}`)
  }
})()

async function createDeploymentStatus (id, state, params) {
  if (!validDeploymentStates.includes(state)) {
    throw new Error(`invalid github deployment status state ${state}, must be one of ${validDeploymentStates.join(', ')}`)
  }

  const resp = await client.request('POST /repos/:owner/:repo/deployments/:deployment_id/statuses', {
    ...params,
    deployment_id: id,
    owner,
    repo,
    state,
    mediaType: {
      previews: ['flash', 'ant-man']
    }
  })

  checkResponse(resp)

  return resp.data
}

function checkResponse (resp: OctokitResponse<any>) {
  if (resp.status !== 201) {
    console.error(`Creating deployment failed: ${resp.status} - ${resp.data.error}`)
    throw new Error('Failed to create the deployment')
  }
}

function input (name: string, defaultValue?: string): string | null {
  let value = getInput(name)

  if (!value || value === '') {
    value = defaultValue
  }

  if (debug) {
    console.debug('got input', name, value)
  }

  return value
}

function output (name: string, value: string) {
  if (debug) {
    console.debug('outputting', name, value)
  }

  setOutput(name, value)
}

function filterMissing (original: object) {
  let result = {}

  Object.keys(original).forEach(key => {
    if (original[key] && original[key] !== '') {
      result[key] = original[key]
    }
  })

  return result
}

function isTrue (value: boolean | string): boolean {
  return true
}
