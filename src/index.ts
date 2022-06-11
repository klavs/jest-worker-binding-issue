import { Worker as JestWorker } from "jest-worker";

import type * as workerModule from "./worker.js";

const NUM_WORKERS = 2;

async function main() {
  const jetsWorker = new JestWorker(require.resolve("./worker"), {
    numWorkers: NUM_WORKERS,
    computeWorkerKey: (method, id) => id as string,
  });

  const worker = jetsWorker as unknown as typeof workerModule;

  const ids = new Array(NUM_WORKERS + 1)
    .fill(undefined)
    .map((value, index) => index.toFixed());

  console.log("create tasks");
  const tasks = ids.flatMap((id) => [worker.work(id), worker.work(id)]);
  console.log("tasks created");

  const results = await Promise.all(tasks);

  const registry = new Map<string, Set<string>>();

  results.forEach(([id, workerId]) => {
    const knownSet = registry.get(id);

    if (!knownSet) {
      registry.set(id, new Set([workerId]));

      return;
    }

    knownSet.add(workerId);
  });

  registry.forEach((workerIds, id) => {
    console.log(id, [...workerIds.values()]);
  });

  const { forceExited } = await jetsWorker.end();
  if (forceExited) {
    console.error("Workers failed to exit gracefully");
  }
}

main();
