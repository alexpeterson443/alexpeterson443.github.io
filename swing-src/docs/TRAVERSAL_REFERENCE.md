# Traversal reference: how the genre's best web-swinging behaves

High-level behaviour notes gathered from public sources (interviews, design analyses, settings
menus, guides) on Insomniac's Marvel's Spider-Man games, used only as a quality reference for an
original implementation. No proprietary code, assets or parameters. Tags:
**[C]** confirmed by a source · **[E]** estimate from footage/community · **[D]** design inference.
No public source gives exact in-game speeds, FOV or rope lengths.

## 1. Swing input
- [C] Hold swing to fire at a nearby attach point and pendulum down then up. Swinging is a custom
  movement state; physics is mostly used for collision.
  (gamedeveloper.com/design/making-insomniac-s-i-spider-man-i-do-what-a-spider-can)
- [C] With no stick input the arc is bent to keep you going as straight as possible. The stick
  steers anywhere, but steering against momentum costs speed.
  (gamedeveloper.com/design/marvel-s-spider-man-design-analysis)
- [C] Release timing: letting go early drops you toward the street; letting go at the end of the
  arc throws you forward. Jump at the bottom of the arc sends you mostly horizontally; jump at the
  end of the arc sends you up. (playstationlifestyle.net 2018/09/07 web-swinging)
- [C] Ideal swing-jump moment is when the legs tuck to ~90° on the upswing. Point launch: press jump
  the moment you land on the point. (redbull.com spider-man-ps4 web-swinging tips)
- [C] Web zip adds a short burst; the first game allows one zip between swings until upgraded.
- [C] Later game adds: charge jump, dive, swing kick, air tricks with stick direction, wall-run
  boost (jump during wall run), slingshot, loop-de-loop, corner tether.
- [E] Good release window ≈ last 20–35% of the upswing; "perfect" jump window ≈ 100–150 ms.
- [D] Holding swing past the top re-fires toward a new anchor rather than stalling.

## 2. Anchors
- [C] Webs attach to tagged points on building edges or trees; the game picks points that keep
  momentum and head toward the destination. No webs to the sky: in parks you swing low from trees.
- [C] Anchors not far off to the side give controllable swings; an outward push keeps you centred
  over the street; streets were built narrower than real scale to keep swing angles steep.
- [E] Anchors ≈ 20–40 m ahead, 15–30 m above, 30–45° forward of vertical; web lengths ≈ 20–45 m.
- [D] Score: forward distance along velocity, height, sideways-offset penalty, intended heading.

## 3. Speeds
- [C] Top speed in the first two games was capped by city streaming (≈ one 128 m tile per second).
- [C] Swinging out of a long dive yields far more speed than starting from the street.
- [E] The later game's upgraded swing is ≈ 2× the first game's.
- [D] Targets: cruise swing 25–30 m/s (55–65 mph); strong chain ≈ 40 m/s (90 mph); dive terminal
  ≈ 55 m/s; extreme (later-game style) 65–80 m/s.

## 4. Camera
- [C] FOV and follow distance grow with speed; each web shot adds a brief FOV bump (a "dolly zoom
  heartbeat"); camera pitch follows the arc tangent and the hero's vertical frame position moves
  along the arc. (jbsiraudin.github.io/blog/spiderman-dolly)
- [C] Camera lags then catches up; dips when a web is thrown forward then accelerates to catch
  up; tilts down in high dives to show the ground coming.
- [C] Optional auto-follow rotates the camera behind the hero.
- [E] Base FOV ≈ 60–65°, up to 80–90° at top speed; distance ≈ 4 m → 7 m; roll ≈ 5–10° into turns.

## 5. Animation and presentation
- [C] Camera, FOV and animation sell superhuman speed more than literal physics does.
- [C] Swinging should never feel like flying: you should feel the pendulum pulling on you.
- [C] Low passes near trees/ground feel faster.
- [D] Pose arc: web arm reaches and locks toward the anchor → body hangs along the rope with legs
  trailing at the bottom → legs tuck on the upswing (the jump cue) → flip or spread pose on release.
- [D] Wind louder with speed, web "thwip" plus tension creak, speed lines above ≈ 70% top speed,
  light radial blur.

## 6. Assists
- [C] Three "physics cheats": automatic arc correction; the web shortens near the ground; hitting a
  wall becomes a wall run.
- [C] Later game exposes Swing Steering Assistance 0–10 (default 10 = earlier games): lower means
  less resistance/more rope physics; at 0 you can hit the ground and slam into walls. Also a slow
  corner timescale option, hold/toggle swing, fall damage toggle.
- [C] 2004 game: rope length eases toward a target length (handles slack, ground clearance,
  springiness); anchors found by raycasting from the character.

## 7. Developer philosophy
- [C] Make players feel better than they are; swinging is momentum-based with "wiggle room".
- [C] The 2004 design was about making a very hard mechanic accessible.

## Top 10 behaviours to reproduce
1. Pendulum constraint in a custom state, heavier swing gravity, tuned speed gain on the down-swing.
2. Smart anchors: ahead and above, penalise sideways offset, real geometry only, prefer tall.
3. No-input arc correction toward the current heading, strength on a 0–10 assist scale.
4. Ground avoidance by shortening the rope when the arc bottom would hit the street.
5. Timed release and swing jump; jump direction depends on where in the arc you jump.
6. Wall contact becomes a wall run that keeps momentum and jumps off into a new swing.
7. Speed-driven camera: FOV/distance with speed, FOV bump per web shot, pitch follows the arc,
   lag-and-catch-up, tilt down in dives.
8. Speed economy: dives convert height to speed, soft cap, steering against motion costs speed.
9. Web zip and point launch with limited bursts and a perfect-timing bonus.
10. Presentation that sells the pull: arm locked to anchor, body along rope, leg-tuck cue, wind,
    speed lines.
