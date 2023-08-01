import { createDotEnvConfigComponent } from "@well-known-components/env-config-provider"
import { createServerComponent, createStatusCheckComponent } from "@well-known-components/http-server"
import { createLogComponent } from "@well-known-components/logger"
import { createMetricsComponent, instrumentHttpServerWithMetrics } from "@well-known-components/metrics"
import { createPgComponent } from "@well-known-components/pg-component"
import { createFetchComponent } from "./adapters/fetch"
import { createReOrgComponent } from "./logic/reorg/component"
import { AppComponents, GlobalContext } from "./types"
import { metricDeclarations } from "./metrics"

// Initialize all the components of the app
export async function initComponents(): Promise<AppComponents> {
  const config = await createDotEnvConfigComponent({ path: [".env.default", ".env"] })
  const metrics = await createMetricsComponent(metricDeclarations, { config })
  const logs = await createLogComponent({ metrics })
  const server = await createServerComponent<GlobalContext>({ config, logs }, {})
  const statusChecks = await createStatusCheckComponent({ server, config })
  const fetch = await createFetchComponent()
  const database = await createPgComponent({ config, logs, metrics })
  const reorg = await createReOrgComponent({ database })

  await instrumentHttpServerWithMetrics({ metrics, server, config })

  return {
    config,
    logs,
    server,
    statusChecks,
    fetch,
    metrics,
    reorg,
    database,
  }
}
