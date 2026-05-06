import { Slots } from "./aiService";

const IT_JOBS = [
  "Java后端",
  "C/C++底层",
  "数据库",
  "Agent开发",
  "算法",
  "C#",
  "测试开发",
  "自动化测试",
  "前端",
  "运维",
  "实施",
  "售前",
  "项目经理",
  "产品经理",
  "运营",
  "功能测试",
];

export function getRecommendedRoles(slots: Slots): string[] {
  let targetJobNames: string[] = [];

  const { codeLevel, commLevel } = slots;

  if (codeLevel === "High") {
    targetJobNames = [
      "Java后端",
      "C/C++底层",
      "数据库",
      "Agent开发",
      "算法",
      "C#",
      "测试开发",
    ];
  } else if (codeLevel === "Medium") {
    targetJobNames = ["自动化测试", "前端", "运维", "实施"];
  } else if (codeLevel === "Low") {
    if (commLevel === "High" || commLevel === "Medium") {
      targetJobNames = ["售前", "项目经理", "产品经理", "运营"];
    } else {
      targetJobNames = ["功能测试"];
    }
  }

  // Pick up to 2 randomly to show to avoid overloading the user
  const shuffled = targetJobNames.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
}
