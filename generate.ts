import {
  createCanvas,
  loadImage,
} from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import {
  Image,
  monochromeDither,
} from "https://deno.land/x/monke@v0.0.4/mod.ts";
import Data from "./data.ts";
import { Color } from "https://deno.land/x/colors@v0.0.1/src/color.ts";
export async function generateCaptcha() {
  const id = Math.ceil(Math.random() * 20);
  const bg = await loadImage(`bg/${id}.jpg`);
  const canvas = createCanvas(792, 792);

  const ctx = canvas.getContext("2d");

  ctx.drawImage(bg, 0, 0);

  ctx.fillStyle = `rgba(${Math.floor(Math.random() * 256)}, ${
    Math.floor(Math.random() * 256)
  }, ${Math.floor(Math.random() * 256)}, 0.2)`;

  ctx.fillRect(0, 0, 792, 792);

  const images: number[] = new Array(4 + Math.ceil(Math.random() * 2)).fill(
    NaN,
  );

  for (let i = 0; i < images.length; ++i) {
    let add = Math.ceil(Math.random() * Data.length);
    while (images.indexOf(add) !== -1) {
      add = Math.ceil(Math.random() * Data.length);
    }
    images[i] = add;
  }
  ctx.fillStyle = `rgba(0,0,0,1)`;

  const added: { points: [number, number]; info: [string, string] }[] = [];
  for (const image of images) {
    const img = await loadImage(`images/${image}.png`);
    const info = Data[image - 1] as [string, string];
    let [dx, dy] = [
      72 + Math.floor(Math.random() * 576),
      72 + Math.floor(Math.random() * 576),
    ];
    // @ts-ignore I know
    if (added.length !== 0) {
      while (
        meanDistance(
          dx,
          dy,
          ...(added[findClosestImage(dx, dy, added)].points),
        ) <
          144
      ) {
        if (Math.random() < 0.5) {
          dx += 36;
          if (dx >= 648) dx = 36;
        } else {
          dy += 36;
          if (dy >= 648) dy = 36;
        }
      }
    }
    ctx.drawImage(img, dx, dy);
    added.push({ points: [dx + 36, dy + 36], info });
  }

  ctx.fillStyle = `rgba(${Math.floor(Math.random() * 256)}, ${
    Math.floor(Math.random() * 256)
  }, ${Math.floor(Math.random() * 256)}, 0.3)`;

  ctx.fillRect(0, 0, 792, 792);

  const image = new Image(ctx.getImageData(0, 0, 792, 792).data, 792, 792);

  image.dither([new Color(0, 0, 0), new Color(255, 255, 255)]);
  ctx.putImageData(image.toImageData(), 0, 0);

  return {
    data: added,
    image: canvas.toDataURL(),
  };
}

function findClosestImage(
  dx: number,
  dy: number,
  points: { points: [number, number]; info: [string, string] }[],
): number {
  const closest = {
    dist: Infinity,
    i: 0,
  };
  let i = 0;
  while (i < points.length) {
    const m = meanDistance(dx, dy, points[i].points[0], points[i].points[1]);
    if (m < closest.dist) {
      closest.dist = m;
      closest.i = i;
    }
    i += 1;
  }
  return closest.i;
}

export function meanDistance(
  dx: number,
  dy: number,
  x: number,
  y: number,
): number {
  return (Math.abs(x - dx) + Math.abs(y - dy)) / 2;
}
