import { World } from 'miniplex';

export const spawnRunnerLabel = (
  world: World,
  x: number,
  y: number,
  text: string,
  ttl?: number
) => {
  const kill = ttl !== undefined ? { ttl } : { offscreen_kill: true };

  return world.add({
    x,
    y,
    label: { text },
    runner: { y: -32 },
    ...kill,
  });
};
