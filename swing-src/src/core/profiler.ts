/** Lightweight CPU scope profiler with rolling averages. */
export class Profiler {
  private starts = new Map<string, number>();
  readonly avg = new Map<string, number>();
  private readonly alpha = 0.08;

  begin(name: string): void {
    this.starts.set(name, performance.now());
  }
  end(name: string): number {
    const s = this.starts.get(name);
    if (s === undefined) return 0;
    const d = performance.now() - s;
    const a = this.avg.get(name);
    this.avg.set(name, a === undefined ? d : a + (d - a) * this.alpha);
    return d;
  }
  get(name: string): number {
    return this.avg.get(name) ?? 0;
  }
}
export const profiler = new Profiler();
