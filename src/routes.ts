import { Router } from "express";
import { endGame, getUserInfo, login, register, startGame } from "./apis";

const routes = Router();

routes.get("/", (req, res) => {
  return res.json({ message: "Hello World" });
});

routes.post("/auth/register", register);
routes.post("/auth/login", login);
routes.get("/auth/getUserInfo", getUserInfo);
routes.post("/game/startGame", startGame);
routes.post("/game/endGame", endGame);
export default routes;
