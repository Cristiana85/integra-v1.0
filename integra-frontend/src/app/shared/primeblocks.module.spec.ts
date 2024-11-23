import { PrimeblocksModule } from "./primeblocks.module";


describe('PrimeblocksModule', () => {
  let primeblocksModule: PrimeblocksModule;

  beforeEach(() => {
    primeblocksModule = new PrimeblocksModule();
  });

  it('should create an instance', () => {
    expect(primeblocksModule).toBeTruthy();
  });
});
