import app from "./src/app";
import { Azure } from "./src/azure";

app.listen(process.env.PORT || 8000, () => {
  console.log(`App is running at port: ${process.env.PORT || 8000}`);
});
