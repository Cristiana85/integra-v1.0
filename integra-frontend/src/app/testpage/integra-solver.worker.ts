/// <reference lib="webworker" />

// NB: dipende da come esporti/impacchetti wasm.
// Se usi wasm-pack + bundler, tipicamente importi init e Session.
import init, { Session } from '../../assets/wasm/integra_solver_wasm'; // adattalo al tuo package name

let session: Session | null = null;
let initPromise: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Se init richiede URL wasm, mettilo qui:
    await init({ module_or_path: '/assets/wasm/integra_solver_wasm_bg.wasm' });
    //await init();

    session = new Session();
    console.log('[worker] created session', session.session_id);

    session.set_on_message((jsonMsg: string) => {
      postMessage({ type: 'wasm_message', json: jsonMsg });
    });

    postMessage({ type: 'worker_ready', sessionId: session.session_id });
  })();

  return initPromise;
}

addEventListener('message', async ({ data }) => {
  await ensureReady();
  if (!session) return;

  switch (data.type) {
    case 'configure_and_run':
      session.set_model(data.modelJson);
      session.set_analysis(data.analysisJson);
      session.run(data.runId);
      break;
  }
});
