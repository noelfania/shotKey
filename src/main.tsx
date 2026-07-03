import { render } from "solid-js/web";
import "./index.css";
import App from "./App";
import { setupInfoConsole } from "./infoConsole";

setupInfoConsole();

const root = document.getElementById("root");

if (root !== null) {
  render(() => <App />, root);
}
