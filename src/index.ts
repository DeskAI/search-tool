import { BrowserContext, LLM } from "@deskai/api";

const engineMap = {
  google: "https://www.google.com/search?q=",
  baidu: "https://www.baidu.com/s?ie=UTF-8&wd=",
  bing: "https://www.bing.com/search?q=",
};

export default class {
  engine: string;

  constructor() {
    this.engine = "";

    LLM.addTool({
      name: "Search-Internet",
      description:
        "Used to search or query the data you want from the internet.",
      icon: "https://pfst.cf2.poecdn.net/base/image/12754249deaf6d37699d3c25805a7047aeb0545d37f2937024bee61d78d0efc4?w=1024&h=1024&pmaid=159888930",
      schema: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The content that needs to be searched.",
          },
        },
      },
      configSchema: {
        type: "object",
        properties: {
          engine: {
            type: "string",
            title: "Search Engine",
            enum: Object.keys(engineMap),
            enumNames: ["Google", "百度", "Bing"],
          },
        },
      },
      defaultConfig: {
        engine: "google",
      },
      loadConfig: (config) => {
        if (config.engine) {
          this.engine = config.engine;
        }
      },
      setConfig: (key: string, value: any) => {
        if (key === "engine") {
          this.engine = value;
        }
      },
      func: async (params: any) => {
        if (!params.content) return "";
        const engine = this.engine;
        const url = engineMap[engine] || engineMap["google"];
        const context = new BrowserContext({
          headless: true,
        });
        const page = context.newPage();
        const finalUrl = `${url}${encodeURIComponent(params.content)}`;
        await page.goto(finalUrl);
        const body =
          engine === "google" ? page.locator("#rso") : page.locator("body");
        const text = await body.innerText();
        await context.close();
        return text;
      },
    });
  }
}
