import type { Context, TypedResponse } from "hono";

type THealthResponse ={
    health: boolean;
}

function health(c: Context): Response & TypedResponse<THealthResponse> {
    return c.json({ health: true });
}

export {
    health
}