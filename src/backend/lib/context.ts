import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

async function comparePassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

export const context = {
  bodyModifier: async ({ req, body }: { req: Request, body: { [key: string]: any } }) => {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    if (path === '/api/registration' && method === 'POST') {
      if (body.password) {
        body.password = await hashPassword(body.password)
      }
      if (body.email) {
        const prisma = new PrismaClient();
        const find = await prisma.user.findFirst({
          where: {
            email: body.email
          }
        })
        if (find) {
          return new Response(
            JSON.stringify({
              "error": "Invalid input",
              "issues": {
                "_errors": [],
                "email": {
                  "_errors": [
                    "email has been used"
                  ]
                }
              }
            }), { status: 400, headers: { 'Content-Type': 'application/json' } }
          )
        }

      }
    }
    return body;
  },
  resultModifier: async ({ req, result, body }: { req: Request, result: { [key: string]: any }, body?: { [key: string]: any } }) => {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method
    let modResult = result

    if (modResult.user_data) {
      const mod = (user: any) => {
        delete user.password
        return user
      }
      if (Array.isArray(modResult.user_data)) {
        modResult.user_data = modResult.user_data.map(mod)
      }
      else {
        modResult = mod(modResult.user_data)
      }
    }
    else if (path === '/api/auth/login' && method === 'POST') { //&& (modResult.login_data === null || !await comparePassword(body?.password, modResult.login_data.password))) {
      if (modResult.login_data === null || await comparePassword(body?.password, modResult.login_data?.password) === false) {
        return new Response(
          JSON.stringify({
            "error": "Invalid input",
            "issues": {
              "_errors": [],
              "password": {
                "_errors": [
                  'Incorrect email or password'
                  // await comparePassword(body?.password, modResult.login_data?.password)
                ]
              }
            }
          }), { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }
      if(modResult.login_data.email_verified === false) {
        return new Response(
          JSON.stringify({
            "error": "Invalid input",
            "issues": {
              "_errors": [],
              "email": {
                "_errors": [
                  'Email not verified'
                ]
              }
            }
          }), { status: 400, headers: { 'Content-Type': 'application/json' } }
        )

      }
      else {
        delete modResult.login_data.password
      }
    }

    return modResult;
  },// inject Prisma client di sini juga jika perlu
}