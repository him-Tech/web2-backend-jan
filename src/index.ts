import { createApp } from "./createApp";

const app = createApp();

// TODO: .env
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});
