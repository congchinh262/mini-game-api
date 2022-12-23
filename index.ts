import app from "./src/app";

app.listen(process.env.PORT || 8000, () => {
  console.log(`App is running at port: ${process.env.PORT || 8000}`);
});
