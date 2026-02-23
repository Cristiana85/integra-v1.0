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
      const json_1 = typeof jsonMsg === 'string' ? jsonMsg : String(jsonMsg);
      postMessage({ type: 'wasm_message', json: json_1 });
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
      try {
        // IMPORTANT: nomi corretti
        session.set_model_json(data.modelJson);
        session.set_analysis_json(data.analysisJson);

        // run emette progress/done/error via callback
        session.run(data.runId);
      } catch (e: any) {
        postMessage({ type: 'worker_error', message: String(e?.message ?? e) });
      }
      break;

    case 'set_model':
      session.set_model_json(data.modelJson);
      break;

    case 'push_model':
      session.push_model_json(data.modelJson);
      break;

    case 'set_analysis':
      session.set_analysis_json(data.analysisJson);
      break;

    case 'run':
      session.run(data.runId);
      break;

    case 'cleanup_after_read':
      session.cleanup_after_read();
      break;

    case 'clear_dataset':
      session.clear_dataset();
      break;

    case 'clear_models':
      session.clear_models();
      break;
  }
});
