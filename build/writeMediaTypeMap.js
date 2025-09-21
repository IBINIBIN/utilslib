/** 获取媒体类型映射表 */

import cheerio from "cheerio";
import fs from "fs-extra";
import path from "node:path";

(async function () {
  fetch("https://www.iana.org/assignments/media-types/media-types.xhtml")
    .then((res) => res.text())
    .then((html) => {
      const $ = cheerio.load(html);
      const tables = $('table[id*="table"]');
      const map = {};

      tables.each((index, table) => {
        const name = $(table).attr("id").slice(6);
        const rows = $(table).find("tr");

        const data = rows
          .map((index, row) => {
            const cells = $(row).find("td");
            return cells.eq(1).text().replace(/\n|\s/g, "");
          })
          .get()
          .filter(Boolean);

        map[name] = data;
      });

      const mediaTypesPath = path.join(process.cwd(), "packages/constants/src/media-types.json");
      fs.writeFileSync(mediaTypesPath, JSON.stringify(map, null, 2));
    })
    .catch((error) => {
      console.error("Error:", error);
    });
})();
