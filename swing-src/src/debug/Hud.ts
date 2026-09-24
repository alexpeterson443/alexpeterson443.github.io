/** Minimal DOM HUD: a stats block (debug), a reticle, and a help overlay. */
export class Hud {
  readonly root: HTMLDivElement;
  private stats: HTMLPreElement;
  private help: HTMLDivElement;
  private hint!: HTMLDivElement;
  /** Seconds of actual play before the help card fades on its own. */
  private helpAuto = 6;
  private reticle: HTMLDivElement;
  private speedo: HTMLDivElement;
  private toast: HTMLDivElement;
  private toastT = 0;
  showStats = false;

  constructor(parent: HTMLElement) {
    this.root = document.createElement('div');
    this.root.className = 'hud';
    this.stats = document.createElement('pre');
    this.stats.className = 'hud-stats';
    this.help = document.createElement('div');
    this.help.className = 'hud-help';
    const row = (k: string, a: string) => `<dt>${k}</dt><dd>${a}</dd>`;
    this.help.innerHTML = `<header>Controls <span>H to hide</span></header><dl>
${row('<kbd>WASD</kbd> <kbd>Mouse</kbd>', 'move · look')}
${row('<kbd>Enter</kbd> / <kbd>Shift</kbd>', 'hold to swing · sprint · wall-run')}
${row('<kbd>Space</kbd>', 'jump · mid-swing: jump off')}
${row('<kbd>E</kbd> / <kbd>LMB</kbd>', 'web zip · at ◇ then Space: launch')}
${row('<kbd>Q</kbd>', 'dive')}
${row('<kbd>F</kbd> <kbd>C</kbd> <kbd>R</kbd>', 'trick · drop · reel in')}
${row('<kbd>\`</kbd> <kbd>G</kbd>', 'dev panel · debug draw')}
${row('<kbd>M</kbd> <kbd>T</kbd> <kbd>K</kbd>', 'mute · time of day · suit')}
</dl><footer>Pad: LS/RS · A jump · RT swing · RB zip · LB dive</footer>`;
    this.hint = document.createElement('div');
    this.hint.className = 'hud-hint hidden';
    this.hint.innerHTML = '<kbd>H</kbd> controls';
    this.reticle = document.createElement('div');
    this.reticle.className = 'hud-reticle';
    this.speedo = document.createElement('div');
    this.speedo.className = 'hud-speed';
    this.toast = document.createElement('div');
    this.toast.className = 'hud-toast';
    this.root.append(this.stats, this.help, this.hint, this.reticle, this.speedo, this.toast);
    parent.appendChild(this.root);
  }

  toggleHelp(): void {
    this.helpAuto = -1; // the player chose; stop auto-hiding
    this.setHelp(this.help.classList.contains('hidden'));
  }
  hideHelp(): void {
    this.setHelp(false);
  }
  private setHelp(show: boolean): void {
    this.help.classList.toggle('hidden', !show);
    this.hint.classList.toggle('hidden', show);
  }

  /** Counts down only while the player is moving, so the card is read before it goes. */
  noteActivity(dt: number): void {
    if (this.helpAuto < 0) return;
    this.helpAuto -= dt;
    if (this.helpAuto < 0) this.hideHelp();
  }

  setStats(text: string): void {
    this.stats.style.display = this.showStats ? 'block' : 'none';
    if (this.showStats) { this.help.classList.add('hidden'); this.hint.classList.add('hidden'); }
    if (this.showStats && this.stats.textContent !== text) this.stats.textContent = text;
  }

  private lastMph = -1;
  private lastState = '';
  setSpeed(mps: number, state: string): void {
    const mph = Math.round(mps * 2.23694);
    if (!this.speedoNum) {
      this.speedo.innerHTML = '<div class="v"><b></b><span>mph</span></div><i><em></em></i><small></small>';
      this.speedoNum = this.speedo.querySelector('b')!;
      this.speedoBar = this.speedo.querySelector('em')!;
      this.speedoState = this.speedo.querySelector('small')!;
    }
    if (mph !== this.lastMph) {
      this.lastMph = mph;
      this.speedoNum.textContent = String(mph);
      // bar full at ~110 mph (the top of a strong swing chain)
      this.speedoBar.style.transform = `scaleX(${Math.min(1, mph / 110).toFixed(3)})`;
      this.speedo.classList.toggle('fast', mph > 80);
    }
    if (state !== this.lastState) {
      this.lastState = state;
      this.speedoState.textContent = state.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
  }
  private speedoNum: HTMLElement | null = null;
  private speedoBar!: HTMLElement;
  private speedoState!: HTMLElement;

  /** Show the point-launch reticle at a screen position (null hides it). */
  setReticle(x: number | null, y = 0): void {
    if (x === null) { this.reticle.style.display = 'none'; return; }
    this.reticle.style.display = 'block';
    this.reticle.style.transform = `translate(${x}px, ${y}px) rotate(45deg)`;
  }

  flash(text: string): void {
    this.toast.textContent = text;
    this.toast.style.opacity = '1';
    this.toastT = 1.2;
  }

  update(dt: number): void {
    if (this.toastT > 0) {
      this.toastT -= dt;
      if (this.toastT <= 0) this.toast.style.opacity = '0';
    }
  }
}
