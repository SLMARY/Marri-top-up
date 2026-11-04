/**
 * Vercel Serverless Function Entry Point for UCHIHA MARRI TOP UP
 * 
 * - Exports the Express application instance as default for Vercel (@vercel/node).
 * - Does NOT call app.listen() (Vercel manages HTTP listener lifecycle in serverless lambdas).
 * - Imports the self-contained production bundle './_bundle.js' produced by esbuild during deployment build.
 */
import { app } from './_bundle.js';

export default app;
