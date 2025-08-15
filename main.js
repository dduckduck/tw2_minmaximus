import { Model } from "./mvc/Model.js";
import { Controller } from "./mvc/Controller.js";
import { View } from "./mvc/View.js";

const v = new View();
const m = new Model();
const c = new Controller(v,m);

document.addEventListener("DOMContentLoaded", async (e) => {
    await c.init();
})


