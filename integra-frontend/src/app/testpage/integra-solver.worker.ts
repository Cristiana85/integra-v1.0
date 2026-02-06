/// <reference lib="webworker" />

// NB: dipende da come esporti/impacchetti wasm.
// Se usi wasm-pack + bundler, tipicamente importi init e Session.
import init, { Session } from '../../../wasm/integra_solver_wasm'; // adattalo al tuo package name

let session: Session | null = null;
let ready = false;

async function ensureReady() {
  if (ready) return;

  // init wasm (fetch/instantiate). Con bundler moderno basta:
  await init();

  session = new Session();

  session.set_on_message((jsonMsg: string) => {
    // inoltra al main thread l’envelope già json
    postMessage({ type: 'wasm_message', json: jsonMsg });
  });

  ready = true;
  postMessage({ type: 'worker_ready', sessionId: session.session_id });
}

addEventListener('message', async ({ data }) => {
  await ensureReady();

  if (!session) return;

  try {
    switch (data.type) {
      case 'set_model':
        session.set_model_json(data.modelJson);
        postMessage({ type: 'ack', op: 'set_model' });
        break;

      case 'set_analysis':
        session.set_analysis_json(data.analysisJson);
        postMessage({ type: 'ack', op: 'set_analysis' });
        break;

      case 'run':
        session.run(data.runId);
        postMessage({ type: 'ack', op: 'run', runId: data.runId });
        break;

      case 'get_last_dataset':
        postMessage({ type: 'last_dataset', json: session.get_last_dataset_envelope_json() });
        break;
    }
  } catch (e: any) {
    postMessage({ type: 'worker_error', message: String(e) });
  }
});
