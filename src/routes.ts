import auth from "./controllers/auth";

export const attachPublicRoutes = (app: any): void => {
  app.use("/api/auth", auth);
};
