/// <reference lib="webworker" />

let wasmReady: Promise<WasmEngine> | null = null;

async function getEngine(): Promise<WasmEngine> {
  if (!wasmReady) {
    wasmReady = (async () => {
      await initWasm();
      const engine = new WasmEngine();
      return engine;
    })();
  }
  return wasmReady;
}

addEventListener('message', async ({ data }) => {
  const { kind } = data;

  switch (kind) {
    case 'start': {
      const { requestJson, jobId } = data as { requestJson: string; jobId: string };

      const engine = await getEngine();

      // registra callback progress una sola volta (o ogni start, come preferisci)
      (engine as any).set_progress_callback((json: string) => {
        postMessage({
          kind: 'progress',
          jobId,
          json,
        });
      });

      // esegue la simulazione (sincrona, ma solo dentro il worker)
      const respJson = engine.dispatch_json(requestJson);

      postMessage({
        kind: 'response',
        jobId,
        json: respJson,
      });

      break;
    }

    case 'pause': {
      // hook futuro: se il solver è cooperativo puoi settare un flag in Rust
      // per ora è un no-op, la vera pausa richiede supporto nel core
      break;
    }

    case 'resume': {
      // hook futuro per resume
      break;
    }

    case 'cancel': {
      // il main thread in realtà chiamerà worker.terminate()
      // qui potresti solo fare cleanup se servisse
      break;
    }
  }
});
