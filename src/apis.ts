import * as express from "express";
import cuid from "cuid";
import { prismaClient } from "./prisma";
import bcrypt from "bcrypt";

const validatePw = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

const validateCredential = async (cred: string) => {
  const credential = await prismaClient.credential.findFirst({
    where: {
      cred,
    },
  });
  if (credential!.expiredAt <= new Date(Date.now())) {
    return false;
  }
  return true;
};

export const register = async (req: express.Request, res: express.Response) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).send({
      success: false,
      errorMessage: "Bad request!",
    });
  }
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      return prismaClient.user.create({
        data: {
          name,
          password: hash,
        },
      });
    })
    .then((user) => {
      return res.send({
        success: true,
        data: {
          id: user.id,
          name: user.name,
        },
      });
    })
    .catch((e) => {
      return res.send({
        success: false,
        errorMessage: e,
      });
    });
};

export const login = async (req: express.Request, res: express.Response) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).send({
      success: false,
      errorMessage: "Bad request!",
    });
  }
  return prismaClient.user
    .findFirst({
      where: {
        name,
      },
    })
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({
          success: false,
          erroeMessage: "User name not found!",
        });
      }
      if (!(await validatePw(password, user.password))) {
        return res.status(401).send({
          success: false,
          erroeMessage: "Invalid user name or password!",
        });
      }
      const cred = await prismaClient.credential.upsert({
        create: {
          userId: user.id,
          expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
        },
        update: {
          expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 2),
        },
        where: {
          userId: user.id,
        },
      });
      return res.send({
        success: true,
        data: {
          token: cred.cred,
          userId: user.id,
        },
      });
    })
    .catch((e) => {
      return res.send({
        success: false,
        errorMessage: e,
      });
    });
};

export const getUserInfo = async (
  req: express.Request,
  res: express.Response
) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).send({
      success: false,
      message: "Bad request!",
    });
  }
  const user = await prismaClient.user.findFirst({
    where: {
      id: +userId,
    },
    select: {
      id: true,
      name: true,
      highestScore: true,
    },
  });
  if (!user) {
    return res.status(404).send({
      success: false,
      errorMessage: "User not found!",
    });
  }
  return res.send({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      highestScore: user.highestScore,
    },
  });
};

export const startGame = async (
  req: express.Request,
  res: express.Response
) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(400).send({
      success: false,
      errorMessage: "Bad request",
    });
  }
  if (!(await validateCredential(token as string))) {
    return res.status(403).send({
      errorMessage: "Access Denied!",
    });
  }
  const gameSessionId = `${cuid()}-${Date.now()}`;
  const userId = await prismaClient.credential.findFirst({
    where: {
      cred: token as string,
    },
    select: {
      userId: true,
    },
  });
  if (!userId) {
    return res.send({
      success: false,
      errorMessage: "User not found!",
    });
  }
  return prismaClient.game
    .create({
      data: {
        sessionId: gameSessionId,
        userId: userId.userId,
        expiredAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    })
    .then((gameStats) => {
      return res.send({
        success: true,
        data: {
          sessionId: gameStats.sessionId,
        },
      });
    })
    .catch((e) => {
      return res.send({
        success: false,
        errorMessage: e,
      });
    });
};

export const endGame = async (req: express.Request, res: express.Response) => {
  const { token } = req.headers;
  const { score, gameSessionId } = req.body;
  if (!token || !score || !gameSessionId) {
    return res.status(400).send("Bad request!");
  }
  if (!(await validateCredential(token as string))) {
    return res.status(403).send({
      errorMessage: "Access Denied!",
    });
  }
  const user = await prismaClient.user.findFirst({
    where: {
      credential: {
        cred: token as string,
      },
    },
  });
  const game = await prismaClient.game.findFirst({
    where: {
      sessionId: gameSessionId,
    },
  });
  if (!game || !user) {
    return res.send({
      success: false,
      message: "Data not found!",
    });
  }
  if (user.highestScore < score) {
    await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        highestScore: score,
      },
    });
  }
  return res.send({
    success: true,
    data: {
      gameId: game.id,
      score: score,
    },
  });
};
