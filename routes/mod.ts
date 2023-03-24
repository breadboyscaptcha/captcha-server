import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { generateCaptcha, meanDistance } from "../generate.ts";
import { resolve } from "https://deno.land/std@0.178.0/path/win32.ts";

const points = new Map<
  number,
  { points: [number, number]; info: [string, string] }[]
>();

const router = new Router();
router.get("/challenge", async (ctx) => {
  console.log("Challenged");
  const captcha = await generateCaptcha();
  const id = Date.now();
  const rand = [
    captcha.data[Math.floor(Math.random() * captcha.data.length)],
    captcha.data[Math.floor(Math.random() * captcha.data.length)],
  ];
  points.set(id, rand);
  ctx.response.status = 200;
  ctx.response.body = {
    prompts: [rand[0].info, rand[1].info],
    image: captcha.image,
  };
});
router.post("/challenge", async (ctx) => {
  const body = ctx.request.body({ type: "json" });
  const { points: pts, id } = await body.value as {
    id: number;
    points: [number, number][];
  };
  if (!pts || !id) {
    ctx.response.status = 405;
    return;
  }
  const data = points.get(id);
  if (!data) {
    ctx.response.status = 404;
    return;
  }
  if (
    meanDistance(pts[0][0], pts[0][1], data[0].points[0], data[0].points[1]) <=
      36 &&
    meanDistance(pts[1][0], pts[1][1], data[1].points[0], data[1].points[1]) <=
      36
  ) {
    ctx.response.status = 200;
    ctx.response.body = { message: "Success" };
  } else {
    ctx.response.status = 200;
    ctx.response.body = { message: "Failed" };
  }
  points.delete(id)
});

export const challenge = router;
