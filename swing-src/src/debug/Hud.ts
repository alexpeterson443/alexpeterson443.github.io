/** Minimal DOM HUD: a stats block (debug), a reticle, and a help overlay. */
export class Hud {
  readonly root: HTMLDivElement;
  private stats: HTMLPreElement;
  private help: HTMLDivElement;
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
    this.help.innerHTML = `<b>STRAND</b> · web-swinging prototype<br>
<kbd>WASD</kbd> move · <kbd>Mouse</kbd> look · <kbd>Space</kbd> jump (hold still = super jump)<br>
<kbd>Shift</kbd>/<kbd>RMB</kbd> hold: swing · sprint · wall-run · auto-parkour<br>
<kbd>E</kbd>/<kbd>LMB</kbd> web zip · zip to ◇ point then <kbd>Space</kbd> = point launch<br>
<kbd>Q</kbd> hold: dive · <kbd>F</kbd> trick · <kbd>C</kbd> drop · <kbd>R</kbd> reel in<br>
<kbd>\`</kbd> dev panel · <kbd>G</kbd> debug draw · <kbd>H</kbd> this help · <kbd>M</kbd> mute · <kbd>T</kbd> time of day<br>
Gamepad: LS move · RS look · A jump · RT swing · RB zip · LB dive · Y trick · B drop`;
    this.reticle = document.createElement('div');
    this.reticle.className = 'hud-reticle';
    this.speedo = document.createElement('div');
    this.speedo.className = 'hud-speed';
    this.toast = document.createElement('div');
    this.toast.className = 'hud-toast';
    this.root.append(this.stats, this.help, this.reticle, this.speedo, this.toast);
    parent.appendChild(this.root);
  }

  toggleHelp(): void {
    this.help.classList.toggle('hidden');
  }
  hideHelp(): void {
    this.help.classList.add('hidden');
  }

  setStats(text: string): void {
    this.stats.style.display = this.showStats ? 'block' : 'none';
    if (this.showStats && this.stats.textContent !== text) this.stats.textContent = text;
  }

  setSpeed(mps: number, state: string): void {
    const mph = mps * 2.23694;
    this.speedo.textContent = `${mph.toFixed(0)} mph · ${state}`;
  }

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
